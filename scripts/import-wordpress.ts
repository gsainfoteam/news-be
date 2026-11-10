import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema';
import { Category, Permission, Role } from '../libs/drizzle/src/enum';

const WP_API = 'https://gistnews.co.kr/?rest_route=/wp/v2';
// Posts below this id are WordPress setup leftovers, not articles.
const MIN_POST_ID = 212;
const LEGACY_EMAIL_DOMAIN = 'legacy.gistnews.co.kr';

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
      '/posts&orderby=id&order=asc&_fields=id,date_gmt,modified_gmt,title,content,author,categories,coauthors',
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

  const memberIdByEmail = new Map<string, string>();
  // Legacy authors are former members: soft-deleted so they stay off the roster.
  async function findOrCreateMember({ name, slug }: WpTerm): Promise<string> {
    const email = `${slug}@${LEGACY_EMAIL_DOMAIN}`;
    const cached = memberIdByEmail.get(email);
    if (cached) return cached;
    const [found] = await db
      .select({ id: schema.member.id })
      .from(schema.member)
      .where(eq(schema.member.email, email))
      .limit(1);
    const id =
      found?.id ??
      (
        await db
          .insert(schema.member)
          .values({
            email,
            name: decodeEntities(name),
            role: Role.ALUMNI,
            permission: Permission.NONE,
            deletedAt: new Date(),
          })
          .returning({ id: schema.member.id })
      )[0].id;
    memberIdByEmail.set(email, id);
    return id;
  }

  let imported = 0;
  let skipped = 0;
  let conflicts = 0;
  for (const post of posts) {
    const categoryList = toCategories(
      post.categories.flatMap((id) => categorySlugById.get(id) ?? []),
    );
    if (post.id < MIN_POST_ID || post.content.protected || !categoryList) {
      skipped++;
      continue;
    }

    const authors = (post.coauthors ?? []).flatMap(
      (id) => coauthorById.get(id) ?? [],
    );
    const fallbackAuthor = userById.get(post.author);
    if (authors.length === 0 && fallbackAuthor) authors.push(fallbackAuthor);
    const memberIds: string[] = [];
    for (const author of authors) {
      const id = await findOrCreateMember(author);
      if (!memberIds.includes(id)) memberIds.push(id);
    }

    const inserted = await db.transaction(async (tx) => {
      // Keeping the WordPress id lets old ?p=<id> links redirect to /article/<id>.
      const [row] = await tx
        .insert(schema.article)
        .values({
          id: post.id,
          title: decodeEntities(post.title.rendered),
          content: post.content.rendered,
          categories: categoryList,
          createdAt: fromGmt(post.date_gmt),
          updatedAt: fromGmt(post.modified_gmt),
        })
        .onConflictDoNothing()
        .returning({ id: schema.article.id });
      if (!row) return false;
      if (memberIds.length > 0) {
        await tx.insert(schema.articleAuthor).values(
          memberIds.map((memberId, index) => ({
            articleId: row.id,
            memberId,
            sortOrder: index,
          })),
        );
      }
      return true;
    });
    if (inserted) imported++;
    else conflicts++;
  }

  // Explicit ids bypass the serial sequence, so move it past them.
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('article', 'id'), (SELECT COALESCE(MAX(id), 1) FROM article))`,
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
