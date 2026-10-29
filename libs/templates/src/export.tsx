// libs/templates/template.html로 html 추출: bun run email:export
import { render } from '@react-email/components';

import NewArticle, { NewArticleProps } from './templates/new-article';

const webUrl = process.env.WEB_URL;
if (!webUrl) throw new Error('WEB_URL is required');

const field = (key: string) => `$%${key}%$`;

const props: NewArticleProps = {
  category: field('category'),
  badgeColor: field('badgeColor'),
  title: field('title'),
  subtitle: field('subtitle'),
  authors: field('authors'),
  publishedAt: field('publishedAt'),
  imageUrl: field('imageUrl'),
  articleUrl: field('articleUrl'),
  unsubscribeUrl: field('unsubscribe'),
  // TODO: FE에 구독 설정 페이지가 아직 없어 경로를 가정함, FE 라우트가 정해지면 맞출 것
  settingsUrl: `${webUrl}/subscription`,
  homeUrl: webUrl,
  // TODO: FE에 로고가 아직 배포되지 않아 경로를 가정함, FE 배포 후 확인할 것
  logoUrl: `${webUrl}/logo.png`,
};

void render(<NewArticle {...props} />).then((html) => {
  // 스티비 HTML 에디터는 html·head·body·style 태그를 막으므로 body 안만 꺼내 div로 감싼다
  const body = /<body([^>]*)>([\s\S]*)<\/body>/.exec(html);
  if (!body || /<style/i.test(body[2])) {
    throw new Error('unexpected render output');
  }
  console.log(`<div${body[1]}>${body[2]}</div>`);
});
