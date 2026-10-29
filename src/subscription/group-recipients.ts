import { Category } from '@lib/drizzle';

// 구독자마다 한 통만 보낸다. 여러 카테고리가 겹치면 기사 카테고리 순서상 앞선 것으로 묶는다
export function groupRecipientsByCategory(
  rows: { email: string; category: Category }[],
  articleCategories: Category[],
): Map<Category, string[]> {
  const sorted = [...rows].sort(
    (a, b) =>
      articleCategories.indexOf(a.category) -
      articleCategories.indexOf(b.category),
  );
  const seen = new Set<string>();
  const groups = new Map<Category, string[]>();
  for (const { email, category } of sorted) {
    if (seen.has(email)) continue;
    seen.add(email);
    groups.set(category, [...(groups.get(category) ?? []), email]);
  }
  return groups;
}
