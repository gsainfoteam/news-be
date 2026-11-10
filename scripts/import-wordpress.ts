import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema';
import { Category, Permission, Role } from '../libs/drizzle/src/enum';
import { FileService } from '../libs/file/src/file.service';

const WP_API = 'https://gistnews.co.kr/?rest_route=/wp/v2';
// Posts below this id are WordPress setup leftovers, not articles.
const MIN_POST_ID = 212;
const LEGACY_EMAIL_DOMAIN = 'legacy.gistnews.co.kr';
const CONCURRENCY = 8;

// WordPress category slug -> categories, parent first like the FE's CATEGORY_GROUPS.
const CATEGORIES_BY_SLUG: Record<string, Category[]> = {
  college: [Category.CAMPUS],
  society: [Category.SOCIETY],
  culture: [Category.CULTURE],
  notice: [Category.NOTICE],
  'scholarship-research': [Category.ACADEMIC_RESEARCH],
  scholarship: [Category.ACADEMIC_RESEARCH, Category.ACADEMIC],
  research: [Category.ACADEMIC_RESEARCH, Category.RESEARCH],
  'featured-issue': [Category.PLANNING_SPECIAL],
  featured: [Category.PLANNING_SPECIAL, Category.PLANNING],
  issue: [Category.PLANNING_SPECIAL, Category.SPECIAL],
  reportage: [Category.PLANNING_SPECIAL, Category.REPORTAGE],
  opinion: [Category.OPINION],
  'int-column': [Category.OPINION, Category.INTERNAL_COLUMN],
  'ext-column': [Category.OPINION, Category.EXTERNAL_COLUMN],
  counsel: [Category.OPINION, Category.READERS_COMMITTEE],
  '4cut': [Category.OPINION, Category.CARTOON],
};
// Newspaper issue PDFs belong to the newspaper table, not articles.
const SKIPPED_SLUGS = new Set(['pdf']);
const SITE_HOSTS = new Set([
  'gistnews.co.kr',
  'www.gistnews.co.kr',
  'giscatch.co.kr',
  'www.giscatch.co.kr',
]);
const FILE_EXTENSIONS = new Set(
  'jpg jpeg png gif webp bmp pdf hwp hwpx doc docx ppt pptx xls xlsx zip'.split(
    ' ',
  ),
);
const COMPOUND_SURNAMES = new Set(
  '남궁 제갈 선우 황보 독고 사공 서문 동방'.split(' '),
);

type WpTerm = { id: number; name: string; slug: string };
type WpPost = {
  id: number;
  date_gmt: string;
  modified_gmt: string;
  title: { rendered: string };
  content: { rendered: string; protected: boolean };
  author: number;
  categories: number[];
  coauthors?: number[];
  jetpack_featured_media_url?: string;
};

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match;
    const point =
      code[1].toLowerCase() === 'x'
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);
    return point <= 0x10ffff ? String.fromCodePoint(point) : match;
  });
}

export function toCategories(slugs: string[]): Category[] | null {
  if (slugs.length > 0 && slugs.every((slug) => SKIPPED_SLUGS.has(slug)))
    return null;
  return [...new Set(slugs.flatMap((slug) => CATEGORIES_BY_SLUG[slug] ?? []))];
}

// WordPress stores Korean names as "given family" or "family given"; the 1-char part is the surname.
export function formatName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length !== 2 || !parts.every((part) => /^[가-힣]+$/.test(part)))
    return name.trim();
  const [first, last] = parts;
  const lastIsSurname =
    COMPOUND_SURNAMES.has(last) || (last.length === 1 && first.length > 1);
  return lastIsSurname ? last + first : first + last;
}

// Returns the original file URL for a WordPress-hosted file, unwrapping the Jetpack image CDN.
export function toSourceUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(decodeEntities(raw));
  } catch {
    return null;
  }
  if (/^i\d\.wp\.com$/.test(url.hostname)) {
    const [, host, ...rest] = url.pathname.split('/');
    url = new URL(`https://${host}/${rest.join('/')}`);
  }
  const ext = url.pathname.split('.').pop()?.toLowerCase() ?? '';
  if (!SITE_HOSTS.has(url.hostname) || !FILE_EXTENSIONS.has(ext)) return null;
  url.search = '';
  url.hash = '';
  // The server only answers https, and uploads moved out of the old /wordpress/ install.
  url.protocol = 'https:';
  url.pathname = url.pathname.replace(
    /^\/wordpress\/wp-content\//,
    '/wp-content/',
  );
  return url;
}

// WordPress *_gmt fields are UTC without an offset.
export function fromGmt(value: string): Date {
  return new Date(`${value}Z`);
}

async function fetchJson<T>(
  path: string,
): Promise<{ data: T; totalPages: number }> {
  const res = await fetch(`${WP_API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return {
    data: (await res.json()) as T,
    totalPages: Number(res.headers.get('x-wp-totalpages') ?? 1),
  };
}

async function fetchAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1, totalPages = 1; page <= totalPages; page++) {
    const result = await fetchJson<T[]>(`${path}&per_page=100&page=${page}`);
    items.push(...result.data);
    totalPages = result.totalPages;
  }
  return items;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });

  const [categories, coauthors, users, posts] = await Promise.all([
    fetchAll<WpTerm>('/categories&_fields=id,name,slug'),
    fetchAll<WpTerm>('/coauthors&_fields=id,name,slug'),
    fetchAll<WpTerm>('/users&_fields=id,name,slug'),
    fetchAll<WpPost>(
      '/posts&orderby=id&order=asc&_fields=id,date_gmt,modified_gmt,title,content,author,categories,coauthors,jetpack_featured_media_url',
    ),
  ]);
  const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));
  const userById = new Map(users.map((u) => [u.id, u]));
  const userBySlug = new Map(users.map((u) => [u.slug, u]));
  // Co-Authors Plus names a user's term `cap-<user slug>` with the login as its name.
  const coauthorById = new Map(
    coauthors.map((c) => {
      const slug = c.slug.replace(/^cap-/, '');
      return [c.id, userBySlug.get(slug) ?? { ...c, slug }];
    }),
  );

  // Promises are cached so posts imported in parallel share one member.
  const memberIdByEmail = new Map<string, Promise<string>>();
  function findOrCreateMember({ name, slug }: WpTerm): Promise<string> {
    const email = `${slug}@${LEGACY_EMAIL_DOMAIN}`;
    const cached = memberIdByEmail.get(email);
    if (cached) return cached;
    const id = (async () => {
      const [found] = await db
        .select({ id: schema.member.id })
        .from(schema.member)
        .where(
          and(eq(schema.member.email, email), isNull(schema.member.deletedAt)),
        )
        .limit(1);
      if (found) return found.id;
      const [created] = await db
        .insert(schema.member)
        .values({
          email,
          name: formatName(decodeEntities(name)),
          role: Role.ALUMNI,
          permission: Permission.NONE,
        })
        .returning({ id: schema.member.id });
      return created.id;
    })();
    memberIdByEmail.set(email, id);
    return id;
  }

  const fileService = new FileService(new ConfigService());
  const keyByUrl = new Map<string, Promise<string | null>>();
  const failedUrls: string[] = [];
  // Deterministic keys make a retried upload overwrite instead of duplicating.
  function uploadFile(source: URL): Promise<string | null> {
    const cached = keyByUrl.get(source.href);
    if (cached) return cached;
    const upload = (async () => {
      // Dead WordPress links are kept as is; an S3 failure aborts the run instead.
      // Redirects are refused so a download can't leave the allowlisted hosts.
      const res = await fetch(source, { redirect: 'error' }).catch(
        (error: Error) => error,
      );
      const contentType =
        (!(res instanceof Error) && res.headers.get('content-type')) ||
        'application/octet-stream';
      if (
        res instanceof Error ||
        !res.ok ||
        contentType.startsWith('text/html')
      ) {
        failedUrls.push(
          `${source.href} (${res instanceof Error ? res.message : `${res.status} ${contentType}`})`,
        );
        return null;
      }
      const body = new Uint8Array(await res.arrayBuffer());
      const ext = source.pathname.split('.').pop()!.toLowerCase();
      const hash = createHash('sha1').update(source.href).digest('hex');
      const key = `articles/wordpress/${hash.slice(0, 20)}.${ext}`;
      const uploadUrl = await fileService.createPresignedUrl(
        key,
        body.length,
        contentType,
      );
      const put = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': contentType },
        body,
      });
      if (!put.ok) throw new Error(`S3 PUT ${key} failed: ${put.status}`);
      return key;
    })();
    keyByUrl.set(source.href, upload);
    return upload;
  }

  // Moves WordPress-hosted files to S3; files that fail keep their original URL.
  async function migrateFiles(post: WpPost) {
    const html = post.content.rendered.replace(
      /\s(srcset|sizes)=(["']).*?\2/g,
      '',
    );
    const attrPattern = /\b(src|href)=(["'])(.*?)\2/g;
    const sources = [...html.matchAll(attrPattern)].flatMap(
      (match) => toSourceUrl(match[3]) ?? [],
    );
    const featured =
      post.jetpack_featured_media_url &&
      toSourceUrl(post.jetpack_featured_media_url);
    if (featured) sources.push(featured);

    const keyByHref = new Map<string, string>();
    await Promise.all(
      sources.map(async (source) => {
        const key = await uploadFile(source);
        if (key) keyByHref.set(source.href, key);
      }),
    );
    const content = html.replace(
      attrPattern,
      (match, attr: string, quote: string, raw: string) => {
        const key = keyByHref.get(toSourceUrl(raw)?.href ?? '');
        return key
          ? `${attr}=${quote}${fileService.getUrl(key)}${quote}`
          : match;
      },
    );
    return {
      content,
      imageKeys: [...new Set(keyByHref.values())],
      thumbnailKey: (featured && keyByHref.get(featured.href)) || null,
    };
  }

  // Explicit ids bypass the serial sequence; move it first so an interrupted run can't leave it behind.
  const maxPostId = Math.max(0, ...posts.map((post) => post.id));
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('article', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM article), ${maxPostId}))`,
  );

  const existingIds = new Set(
    (
      await db
        .select({ id: schema.article.id })
        .from(schema.article)
        .where(
          inArray(
            schema.article.id,
            posts.map((post) => post.id),
          ),
        )
    ).map((row) => row.id),
  );

  let imported = 0;
  let skipped = 0;
  let conflicts = 0;
  async function importPost(post: WpPost) {
    if (existingIds.has(post.id)) {
      conflicts++;
      return;
    }
    const categoryList = toCategories(
      post.categories.flatMap((id) => categorySlugById.get(id) ?? []),
    );
    if (post.id < MIN_POST_ID || post.content.protected || !categoryList) {
      skipped++;
      return;
    }

    // A rerun skips existing articles, so missing authors could never be added later.
    const authors = (post.coauthors ?? []).map((id) => {
      const author = coauthorById.get(id);
      if (!author) throw new Error(`post ${post.id}: unknown coauthor ${id}`);
      return author;
    });
    if (authors.length === 0) {
      const author = userById.get(post.author);
      if (!author)
        throw new Error(`post ${post.id}: unknown author ${post.author}`);
      authors.push(author);
    }
    const memberIds: string[] = [];
    for (const author of authors) {
      const id = await findOrCreateMember(author);
      if (!memberIds.includes(id)) memberIds.push(id);
    }

    const files = await migrateFiles(post);
    const inserted = await db.transaction(async (tx) => {
      // Keeping the WordPress id lets old ?p=<id> links redirect to /article/<id>.
      const [row] = await tx
        .insert(schema.article)
        .values({
          id: post.id,
          title: decodeEntities(post.title.rendered),
          ...files,
          categories: categoryList,
          createdAt: fromGmt(post.date_gmt),
          updatedAt: fromGmt(post.modified_gmt),
        })
        .onConflictDoNothing()
        .returning({ id: schema.article.id });
      if (!row) return false;
      await tx.insert(schema.articleAuthor).values(
        memberIds.map((memberId, index) => ({
          articleId: row.id,
          memberId,
          sortOrder: index,
        })),
      );
      return true;
    });
    if (!inserted) conflicts++;
    else if (++imported % 50 === 0) console.log(`... imported ${imported}`);
  }

  // Downloads from WordPress dominate the run time, so posts are imported in parallel.
  const queue = [...posts];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let post = queue.shift(); post; post = queue.shift())
        await importPost(post);
    }),
  );

  if (failedUrls.length > 0)
    console.warn(
      `kept original URL for ${failedUrls.length} files:\n${failedUrls.join('\n')}`,
    );

  console.log(
    `fetched ${posts.length}, imported ${imported}, skipped ${skipped}, already existing ids ${conflicts}`,
  );
  await client.end();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
