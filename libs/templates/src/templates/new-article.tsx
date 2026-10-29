import { Category } from '@lib/drizzle/enum';
import { Button, Heading, Img, Link, Text } from '@react-email/components';
import * as React from 'react';

import { badgeColorOf, CATEGORY_LABEL } from '../category';
import Layout from '../components/layout';

export type NewArticleProps = {
  category: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  authors: string;
  publishedAt: string;
  imageUrl: string;
  articleUrl: string;
  homeUrl: string;
  settingsUrl: string;
  unsubscribeUrl: string;
  logoUrl: string;
};

const NewArticle = ({
  category,
  badgeColor,
  title,
  subtitle,
  authors,
  publishedAt,
  imageUrl,
  articleUrl,
  homeUrl,
  settingsUrl,
  unsubscribeUrl,
  logoUrl,
}: NewArticleProps): React.ReactNode => {
  return (
    <Layout
      preview={`[${category}] ${title}`}
      logoUrl={logoUrl}
      homeUrl={homeUrl}
      footerNote={
        <>
          {category} 카테고리를 구독하셔서 받은 메일입니다.{' '}
          <Link href={settingsUrl} className="text-neutral-700 underline">
            구독 설정 변경
          </Link>
          {' · '}
          <Link href={unsubscribeUrl} className="text-neutral-700 underline">
            수신거부
          </Link>
        </>
      }
    >
      <Text className="m-0 mb-6 text-[15px] leading-[160%] text-neutral-600">
        구독하신 <span className="font-bold text-primary">{category}</span>{' '}
        카테고리에 새 기사가 올라왔어요.
      </Text>
      <Link href={articleUrl}>
        <Img
          src={imageUrl}
          alt={title}
          width="536"
          className="mb-6 w-full rounded-2xl"
        />
      </Link>
      <span
        className="inline-block rounded-full px-2 py-0.5 text-[14px] font-bold text-white"
        style={{ backgroundColor: badgeColor }}
      >
        {category}
      </span>
      <Heading className="m-0 mt-3 text-[22px] leading-[135%] font-bold text-neutral-900">
        <Link href={articleUrl} className="text-neutral-900">
          {title}
        </Link>
      </Heading>
      <Text className="m-0 mt-2 text-[17px] leading-[150%] text-neutral-600">
        {subtitle}
      </Text>
      <Text className="m-0 mt-3 text-[14px] text-neutral-500">
        By {authors} · {publishedAt}
      </Text>
      <Button
        href={articleUrl}
        className="mt-8 rounded-xl bg-primary px-5 py-3 text-[16px] font-semibold text-white"
      >
        기사 읽기
      </Button>
    </Layout>
  );
};

NewArticle.PreviewProps = {
  category: CATEGORY_LABEL[Category.CAMPUS],
  badgeColor: badgeColorOf(Category.CAMPUS),
  title: '2027학년도 학사력 개편안 확정, 가을학기 개강 일주일 앞당겨져',
  subtitle: '학생회 "의견 수렴 기간 짧았다" 아쉬움 표해',
  authors: '홍길동, 김지스트',
  publishedAt: '2026.10.27',
  imageUrl: 'https://picsum.photos/seed/gist/1072/600',
  articleUrl: 'https://example.com/article/1',
  homeUrl: 'https://example.com',
  settingsUrl: 'https://example.com/settings',
  unsubscribeUrl: 'https://example.com/unsubscribe',
  logoUrl:
    'https://raw.githubusercontent.com/gsainfoteam/news-fe/main/public/logo.png',
} satisfies NewArticleProps;

export default NewArticle;
