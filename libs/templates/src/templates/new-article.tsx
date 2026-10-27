import { Category } from '@lib/drizzle/enum';
import { Button, Heading, Img, Link, Text } from '@react-email/components';
import * as React from 'react';

import Layout from '../components/layout';

// news-fe의 카테고리 라벨·배지 색과 맞춘다
const CATEGORY_LABEL: Record<Category, string> = {
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
};

const BADGE_COLOR: Partial<Record<Category, string>> = {
  [Category.SOCIETY]: 'bg-badge-red',
  [Category.CAMPUS]: 'bg-badge-green',
  [Category.ACADEMIC_RESEARCH]: 'bg-badge-blue',
  [Category.CARTOON]: 'bg-badge-blue',
};

export type NewArticleProps = {
  category: Category;
  title: string;
  subtitle: string | null;
  authors: string;
  publishedAt: string;
  imageUrl: string | null;
  articleUrl: string;
  homeUrl: string;
  settingsUrl: string;
  logoUrl: string;
};

const NewArticle = ({
  category,
  title,
  subtitle,
  authors,
  publishedAt,
  imageUrl,
  articleUrl,
  homeUrl,
  settingsUrl,
  logoUrl,
}: NewArticleProps): React.ReactNode => {
  const label = CATEGORY_LABEL[category];
  return (
    <Layout
      preview={`[${label}] ${title}`}
      logoUrl={logoUrl}
      homeUrl={homeUrl}
      footerNote={
        <>
          {label} 카테고리를 구독하셔서 받은 메일입니다.{' '}
          <Link href={settingsUrl} className="text-neutral-700 underline">
            구독 설정 변경
          </Link>
        </>
      }
    >
      <Text className="m-0 mb-6 text-[15px] leading-[160%] text-neutral-600">
        구독하신 <span className="font-bold text-primary">{label}</span>{' '}
        카테고리에 새 기사가 올라왔어요.
      </Text>
      {imageUrl && (
        <Link href={articleUrl}>
          <Img
            src={imageUrl}
            alt={title}
            width="536"
            className="mb-6 w-full rounded-2xl"
          />
        </Link>
      )}
      <span
        className={`${BADGE_COLOR[category] ?? 'bg-badge-default'} inline-block rounded-full px-2 py-0.5 text-[14px] font-bold text-white`}
      >
        {label}
      </span>
      <Heading className="m-0 mt-3 text-[22px] leading-[135%] font-bold text-neutral-900">
        <Link href={articleUrl} className="text-neutral-900">
          {title}
        </Link>
      </Heading>
      {subtitle && (
        <Text className="m-0 mt-2 text-[17px] leading-[150%] text-neutral-600">
          {subtitle}
        </Text>
      )}
      <Text className="m-0 mt-3 text-[14px] text-neutral-500">
        By {authors} · {publishedAt}
      </Text>
      <Button
        href={articleUrl}
        className="mt-8 rounded-xl bg-neutral-800 px-5 py-3 text-[16px] font-semibold text-white"
      >
        기사 읽기
      </Button>
    </Layout>
  );
};

NewArticle.PreviewProps = {
  category: Category.CAMPUS,
  title: '2027학년도 학사력 개편안 확정, 가을학기 개강 일주일 앞당겨져',
  subtitle: '학생회 "의견 수렴 기간 짧았다" 아쉬움 표해',
  authors: '홍길동, 김지스트',
  publishedAt: '2026.10.27',
  imageUrl: 'https://picsum.photos/seed/gist/1072/600',
  articleUrl: 'https://example.com/article/1',
  homeUrl: 'https://example.com',
  settingsUrl: 'https://example.com/settings',
  logoUrl:
    'https://raw.githubusercontent.com/gsainfoteam/news-fe/main/public/logo.png',
} satisfies NewArticleProps;

export default NewArticle;
