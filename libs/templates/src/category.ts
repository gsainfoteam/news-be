import { Category } from '@lib/drizzle/enum';

// news-fe의 카테고리 라벨·배지 색과 맞춘다
export const CATEGORY_LABEL: Record<Category, string> = {
  [Category.CAMPUS]: '대학',
  [Category.SOCIETY]: '사회',
  [Category.ACADEMIC_RESEARCH]: '학술·연구',
  [Category.ACADEMIC]: '학술',
  [Category.RESEARCH]: '연구',
  [Category.CULTURE]: '문화',
  [Category.PLANNING_SPECIAL]: '기획·특집',
  [Category.PLANNING]: '기획',
  [Category.SPECIAL]: '특집',
  [Category.REPORTAGE]: '현장르포',
  [Category.OPINION]: '오피니언',
  [Category.INTERNAL_COLUMN]: '내부 칼럼',
  [Category.EXTERNAL_COLUMN]: '외부 칼럼',
  [Category.READERS_COMMITTEE]: '독자자문위원회',
  [Category.CARTOON]: '4컷 만화/만평',
  [Category.NOTICE]: '공지사항',
};

const BADGE_COLOR_DEFAULT = '#525252';

const BADGE_COLOR: Partial<Record<Category, string>> = {
  [Category.SOCIETY]: '#c10007',
  [Category.CAMPUS]: '#00a63e',
  [Category.ACADEMIC_RESEARCH]: '#1447e6',
  [Category.CARTOON]: '#1447e6',
};

export const badgeColorOf = (category: Category): string =>
  BADGE_COLOR[category] ?? BADGE_COLOR_DEFAULT;
