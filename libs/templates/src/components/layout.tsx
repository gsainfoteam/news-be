import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

// news-fe의 src/styles/global.css 토큰과 Tailwind v4 팔레트 값을 그대로 옮겼다
const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        primary: '#de3624',
        secondary: '#59625d',
        'badge-default': '#525252',
        'badge-red': '#c10007',
        'badge-green': '#00a63e',
        'badge-blue': '#1447e6',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'sans-serif',
        ],
      },
    },
  },
};

const Layout = ({
  preview,
  logoUrl,
  homeUrl,
  footerNote,
  children,
}: {
  preview: string;
  logoUrl: string;
  homeUrl: string;
  footerNote: React.ReactNode;
  children: React.ReactNode;
}): React.ReactNode => {
  return (
    <Html lang="ko">
      <Head>
        <title>{preview}</title>
      </Head>
      <Tailwind config={tailwindConfig}>
        <Body className="m-0 bg-neutral-100 py-10 font-sans break-keep text-neutral-900">
          <Preview>{preview}</Preview>
          <Container className="max-w-[600px] rounded-2xl bg-white">
            <Section className="px-8 pt-8 pb-6">
              <Link href={homeUrl}>
                <Img src={logoUrl} width="120" height="30" alt="지스트신문" />
              </Link>
            </Section>
            <Hr className="m-0 border-neutral-200" />
            <Section className="px-8 pt-8 pb-10">{children}</Section>
            <Section className="rounded-b-2xl bg-neutral-50 px-8 py-6">
              <Text className="m-0 mb-3 text-[13px] leading-[160%] text-neutral-500">
                {footerNote}
              </Text>
              <Text className="m-0 text-[12px] leading-[160%] text-neutral-500">
                광주광역시 북구 첨단과기로123 제1학생회관 3층 GIST신문사
                <br />
                editor@gist.ac.kr · Copyright ⓒ지스트신문. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Layout;
