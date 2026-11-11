import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { setTimeout } from 'timers/promises';
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
// The 신문사 소개 page lists the staff by section; unlisted authors are alumni.
const STAFF_PAGE_ID = 5582;
const ROLE_BY_SECTION: Record<string, Role> = {
  'editor/편집장': Role.EDITOR_IN_CHIEF,
  'editor/부편집장': Role.DEPUTY_EDITOR_IN_CHIEF,
  'seniorReporter/책임기자': Role.REPORTING_SENIOR_REPORTER,
  'seniorDesigner/책임디자이너': Role.SENIOR_DESIGNER,
  'seniorDigital/책임기자': Role.DIGITAL_SENIOR_REPORTER,
  'reporter/정기자': Role.REPORTING_REPORTER,
  'designer/디자이너': Role.DESIGNER,
  'digital/정기자': Role.DIGITAL_REPORTER,
  'junior/수습기자': Role.CUB_REPORTER,
  'left/거쳐간 사람들': Role.ALUMNI,
};

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
// Early posts link files through the server's bare IP.
const LEGACY_SERVER_IP = '101.101.219.43';
const FILE_EXTENSIONS = new Set(
  'jpg jpeg png gif webp bmp pdf hwp hwpx doc docx ppt pptx xls xlsx zip'.split(
    ' ',
  ),
);
const NEWSPAPER_DIR = 'https://gistnews.co.kr/wordpress/PDFs/';
// Publish dates from the history page and the newspaper posts (창간준비호 from its PDF);
// issues in between are interpolated.
const NEWSPAPER_DATES: [issue: number, date: string][] = [
  [0, '2016-01-29'],
  [1, '2016-04-11'],
  [3, '2016-05-31'],
  [11, '2017-06-30'],
  [19, '2018-05-30'],
  [24, '2019-03-11'],
  [31, '2020-03-18'],
  [38, '2021-03-10'],
  [45, '2022-03-04'],
  [50, '2022-12-02'],
  [51, '2023-03-08'],
  [56, '2024-04-08'],
  [61, '2025-04-01'],
  [68, '2026-03-12'],
  [69, '2026-05-15'],
  [70, '2026-07-24'],
  [71, '2026-09-22'],
  [72, '2026-11-10'],
];
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

type StaffMember = { key: string; name: string; role: Role; posts: number };

// Gravatar hashes tell apart staff sharing a display name; sections run from senior to
// alumni, so a person's first listing wins.
export function parseStaff(html: string): StaffMember[] {
  const staff = new Map<string, StaffMember>();
  let section = '';
  let title = '';
  let avatar = '';
  let name = '';
  const tokens =
    /\bid="(\w+)"|td-pulldown-size">(.*?)<|(<img[^>]*\bavatar\b[^>]*>)|td-authors-name"><a[^>]*>(.*?)<\/a>|td-author-post-count">(\d+)/g;
  for (const [, id, heading, img, author, posts] of html.matchAll(tokens)) {
    if (id) section = id;
    else if (heading) title = heading;
    else if (img) avatar = /\/avatar\/([\da-f]{32})/.exec(img)?.[1] ?? '';
    else if (author) name = decodeEntities(author);
    else {
      const role = ROLE_BY_SECTION[`${section}/${title}`];
      const key = avatar || name;
      if (role && !staff.has(key))
        staff.set(key, { key, name, role, posts: Number(posts) });
    }
  }
  return [...staff.values()];
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
  if (url.hostname === LEGACY_SERVER_IP) url.hostname = 'gistnews.co.kr';
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type JetpackSlide = { src: string; alt?: string; caption?: string };

// Normalizes markup the FE can't render: Jetpack slideshows keep their images in a JSON
// attribute, old post links point at WordPress, and spacer paragraphs pile up.
export function cleanContent(html: string, articleIds: Set<number>): string {
  return html
    .replace(/\s(srcset|sizes)=(["']).*?\2/g, '')
    .replace(/<p class="jetpack-slideshow-noscript[^"]*">.*?<\/p>/g, '')
    .replace(
      /<div[^>]*\bdata-gallery=(["'])(.*?)\1[^>]*><\/div>/g,
      (_, _quote, json: string) =>
        (JSON.parse(decodeEntities(json)) as JetpackSlide[])
          .map(
            ({ src, alt, caption }) =>
              `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt ?? '')}">${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}</figure>`,
          )
          .join(''),
    )
    .replace(/\bhref=(["'])(.*?)\1/g, (match, quote: string, raw: string) => {
      let url: URL;
      try {
        url = new URL(decodeEntities(raw));
      } catch {
        return match;
      }
      const id = Number(url.searchParams.get('p'));
      const isPostLink =
        (SITE_HOSTS.has(url.hostname) || url.hostname === LEGACY_SERVER_IP) &&
        url.pathname === '/' &&
        articleIds.has(id);
      return isPostLink ? `href=${quote}/article/${id}${quote}` : match;
    })
    .replace(/(<p>(&nbsp;|\s)*<\/p>\s*){2,}/g, '<p>&nbsp;</p>\n');
}

// Picks the outlined PDF of each issue; 제98호 is a misnamed re-upload of 제68호.
export function toNewspaperIssue(file: string): number | null {
  if (file === '창간준비호.pdf') return 0;
  if (file === '지스트신문-창간호-아웃라인화.pdf') return 1;
  const issue = Number(
    /^(?:지스트신문-)?제?(\d+)호[-_]아웃라인화\.pdf$/.exec(file)?.[1],
  );
  return issue > 1 && issue !== 98 ? issue : null;
}

export function newspaperTitle(issue: number): string {
  return issue === 0 ? '창간준비호' : issue === 1 ? '창간호' : `제${issue}호`;
}

// Returns null past the last known issue.
export function newspaperDate(issue: number): Date | null {
  const next = NEWSPAPER_DATES.findIndex(([known]) => known >= issue);
  if (next === -1) return null;
  const [toIssue, to] = NEWSPAPER_DATES[next];
  if (toIssue === issue || next === 0) return new Date(to);
  const [fromIssue, from] = NEWSPAPER_DATES[next - 1];
  const start = Date.parse(from);
  const ratio = (issue - fromIssue) / (toIssue - fromIssue);
  const day = 86_400_000;
  return new Date(
    start + Math.round(((Date.parse(to) - start) * ratio) / day) * day,
  );
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

  const [categories, coauthors, users, posts, staffPage] = await Promise.all([
    fetchAll<WpTerm>('/categories&_fields=id,name,slug'),
    fetchAll<WpTerm>('/coauthors&_fields=id,name,slug'),
    fetchAll<WpTerm>('/users&_fields=id,name,slug'),
    fetchAll<WpPost>(
      '/posts&orderby=id&order=asc&_fields=id,date_gmt,modified_gmt,title,content,author,categories,coauthors,jetpack_featured_media_url',
    ),
    fetchJson<{ content: { rendered: string } }>(
      `/pages/${STAFF_PAGE_ID}&_fields=content`,
    ),
  ]);
  const staff = parseStaff(staffPage.data.content.rendered);
  // The page shows 0 posts for some authors, so a name match counts unless a listing
  // with posts already claims it (two staff can share a name).
  const authorNames = new Set(users.map((u) => decodeEntities(u.name)));
  const claimed = new Set(staff.filter((s) => s.posts > 0).map((s) => s.name));
  const isAuthor = (s: StaffMember) =>
    authorNames.has(s.name) && (s.posts > 0 || !claimed.has(s.name));
  const roleOf = (name: string) =>
    staff.find((s) => isAuthor(s) && s.name === decodeEntities(name))?.role ??
    Role.ALUMNI;
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
  function findOrCreateMember(
    { name, slug }: Pick<WpTerm, 'name' | 'slug'>,
    role = roleOf(name),
  ): Promise<string> {
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
          role,
          permission: Permission.NONE,
        })
        .returning({ id: schema.member.id });
      return created.id;
    })();
    memberIdByEmail.set(email, id);
    return id;
  }

  const fileService = new FileService(new ConfigService());
  async function putObject(key: string, body: Uint8Array, contentType: string) {
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
  }
  const keyByUrl = new Map<string, Promise<string | null>>();
  const failedUrls: string[] = [];
  // Deterministic keys make a retried upload overwrite instead of duplicating.
  function uploadFile(source: URL): Promise<string | null> {
    const cached = keyByUrl.get(source.href);
    if (cached) return cached;
    const upload = (async () => {
      // Dead WordPress links are kept as is; an S3 failure aborts the run instead.
      // Redirects are refused so a download can't leave the allowlisted hosts.
      // Network errors, 429 and 5xx are retried so a flaky moment doesn't drop a file for good.
      let res: Response | Error = new Error('not fetched');
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await setTimeout(1000 * 2 ** attempt);
        res = await fetch(source, { redirect: 'error' }).catch(
          (error: Error) => error,
        );
        if (!(res instanceof Error) && res.status !== 429 && res.status < 500)
          break;
      }
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
      await putObject(key, body, contentType);
      return key;
    })();
    keyByUrl.set(source.href, upload);
    return upload;
  }

  // Moves WordPress-hosted files to S3; files that fail keep their original URL.
  async function migrateFiles(post: WpPost) {
    const html = cleanContent(post.content.rendered, importableIds);
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
    sql`SELECT setval(pg_get_serial_sequence('article', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM article), ${maxPostId}, nextval(pg_get_serial_sequence('article', 'id'))))`,
  );

  // Members from an earlier run pick up the current roles too.
  for (const user of users)
    await db
      .update(schema.member)
      .set({ role: roleOf(user.name) })
      .where(
        and(
          eq(schema.member.email, `${user.slug}@${LEGACY_EMAIL_DOMAIN}`),
          isNull(schema.member.deletedAt),
        ),
      );
  // Every listed staff gets a member, even without an imported article.
  for (const s of staff) {
    const hash = createHash('sha1').update(s.key).digest('hex').slice(0, 12);
    const terms = isAuthor(s)
      ? users.filter((u) => decodeEntities(u.name) === s.name)
      : [{ name: s.name, slug: `staff-${hash}` }];
    for (const term of terms) {
      const id = await findOrCreateMember(term, s.role);
      await db
        .update(schema.member)
        .set({ role: s.role })
        .where(eq(schema.member.id, id));
    }
  }

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

  const categoriesOf = (post: WpPost) =>
    post.id < MIN_POST_ID || post.content.protected
      ? null
      : toCategories(
          post.categories.flatMap((id) => categorySlugById.get(id) ?? []),
        );
  const importableIds = new Set(
    posts.filter((post) => categoriesOf(post)).map((post) => post.id),
  );

  let imported = 0;
  let skipped = 0;
  let conflicts = 0;
  async function importPost(post: WpPost) {
    if (existingIds.has(post.id)) {
      conflicts++;
      return;
    }
    const categoryList = categoriesOf(post);
    if (!categoryList) {
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

  // Newspaper PDFs live outside WordPress media, so they are read from the directory listing.
  const listingRes = await fetch(NEWSPAPER_DIR);
  if (!listingRes.ok)
    throw new Error(`GET ${NEWSPAPER_DIR} failed: ${listingRes.status}`);
  const listing = await listingRes.text();
  const fileByIssue = new Map<number, string>();
  for (const [, href] of listing.matchAll(/href="([^"?/][^"]*\.pdf)"/g)) {
    const file = decodeURIComponent(href);
    const issue = toNewspaperIssue(file);
    if (issue !== null) fileByIssue.set(issue, file);
  }
  const existingTitles = new Set(
    (
      await db.select({ title: schema.newspaper.title }).from(schema.newspaper)
    ).map((row) => row.title),
  );
  const newspaperQueue = [...fileByIssue].filter(
    ([issue]) => !existingTitles.has(newspaperTitle(issue)),
  );
  let newspapers = 0;
  // PDFs reach ~50MB, so fewer run at once than articles.
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      for (
        let entry = newspaperQueue.shift();
        entry;
        entry = newspaperQueue.shift()
      ) {
        const [issue, file] = entry;
        const res = await fetch(NEWSPAPER_DIR + encodeURIComponent(file), {
          redirect: 'error',
        });
        if (!res.ok || res.headers.get('content-type') !== 'application/pdf')
          throw new Error(`GET ${file} failed: ${res.status}`);
        const body = new Uint8Array(await res.arrayBuffer());
        const hash = createHash('sha1').update(file).digest('hex');
        // The API only accepts keys shaped like newspaper/<uuid>/<name>.pdf.
        const uuid = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
        const fileKey = `newspaper/${uuid}/issue-${issue}.pdf`;
        // Issues newer than the known dates fall back to the upload time.
        const date =
          newspaperDate(issue) ??
          new Date(res.headers.get('last-modified') ?? Date.now());
        await putObject(fileKey, body, 'application/pdf');
        await db
          .insert(schema.newspaper)
          .values({
            title: newspaperTitle(issue),
            fileKey,
            createdAt: date,
            updatedAt: date,
          })
          .onConflictDoNothing();
        newspapers++;
      }
    }),
  );
  console.log(
    `newspapers: ${fileByIssue.size} found, ${newspapers} imported, ${existingTitles.size} already existing`,
  );
  await client.end();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
