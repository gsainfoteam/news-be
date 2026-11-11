import { Category, Role } from '../libs/drizzle/src/enum';
import {
  cleanContent,
  decodeEntities,
  formatName,
  fromGmt,
  newspaperDate,
  newspaperTitle,
  parseStaff,
  toCategories,
  toNewspaperIssue,
  toSourceUrl,
} from './import-wordpress';

test('formatName joins Korean names surname first', () => {
  expect(formatName('지원 정')).toBe('정지원');
  expect(formatName('백 승혁')).toBe('백승혁');
  expect(formatName('권탁 강')).toBe('강권탁');
  expect(formatName('민수 남궁')).toBe('남궁민수');
  expect(formatName('남궁 민수')).toBe('남궁민수');
  expect(formatName('Tran Huyen Bao Dang')).toBe('Tran Huyen Bao Dang');
  expect(formatName('joiner')).toBe('joiner');
});

describe('toSourceUrl', () => {
  test('unwraps the Jetpack CDN and drops the query', () => {
    expect(
      toSourceUrl(
        'https://i0.wp.com/gistnews.co.kr/wp-content/uploads/2026/11/정책.jpg?resize=533%2C356&#038;ssl=1',
      )?.href,
    ).toBe(
      'https://gistnews.co.kr/wp-content/uploads/2026/11/%EC%A0%95%EC%B1%85.jpg',
    );
  });

  test('accepts attachments on the old domains over https', () => {
    expect(
      toSourceUrl('http://www.giscatch.co.kr/wordpress/downloads/a%20b.hwp')
        ?.href,
    ).toBe('https://www.giscatch.co.kr/wordpress/downloads/a%20b.hwp');
  });

  test('maps the old /wordpress/ uploads path', () => {
    expect(
      toSourceUrl(
        'http://gistnews.co.kr/wordpress/wp-content/uploads/2021/10/a.png',
      )?.href,
    ).toBe('https://gistnews.co.kr/wp-content/uploads/2021/10/a.png');
  });

  test('ignores post links and other sites', () => {
    expect(toSourceUrl('https://gistnews.co.kr/?p=7416')).toBeNull();
    expect(toSourceUrl('https://example.com/a.jpg')).toBeNull();
    expect(toSourceUrl('#top')).toBeNull();
  });
});

describe('toCategories', () => {
  test('adds the parent category and dedupes', () => {
    expect(toCategories(['featured', 'issue', 'featured-issue'])).toEqual([
      Category.PLANNING_SPECIAL,
      Category.PLANNING,
      Category.SPECIAL,
    ]);
  });

  test('ignores unmapped slugs but keeps the post', () => {
    expect(toCategories(['featured-2', 'college'])).toEqual([Category.CAMPUS]);
    expect(toCategories(['uncategorized'])).toEqual([]);
  });

  test('skips newspaper PDF posts', () => {
    expect(toCategories(['pdf'])).toBeNull();
    expect(toCategories(['pdf', 'notice'])).toEqual([Category.NOTICE]);
  });
});

describe('cleanContent', () => {
  test('turns a Jetpack slideshow into figures', () => {
    const gallery =
      '<p class="jetpack-slideshow-noscript robots-nocontent">JS 필요</p><div class="jetpack-slideshow" data-gallery="[{&quot;src&quot;:&quot;https:\\/\\/i0.wp.com\\/gistnews.co.kr\\/a.jpg?fit=696\\u0026ssl=1&quot;,&quot;alt&quot;:&quot;&quot;,&quot;caption&quot;:&quot;사진 &lt;1&gt;&quot;}]" itemscope></div>';
    expect(cleanContent(gallery, new Set())).toBe(
      '<figure><img src="https://i0.wp.com/gistnews.co.kr/a.jpg?fit=696&amp;ssl=1" alt=""><figcaption>사진 &lt;1&gt;</figcaption></figure>',
    );
  });

  test('points links to imported posts at the new article page', () => {
    const html =
      '<a href="http://giscatch.co.kr/?p=928">a</a><a href="https://gistnews.co.kr/?p=5">b</a><a href="https://example.com/?p=928">c</a>';
    expect(cleanContent(html, new Set([928]))).toBe(
      '<a href="/article/928">a</a><a href="https://gistnews.co.kr/?p=5">b</a><a href="https://example.com/?p=928">c</a>',
    );
  });

  test('collapses runs of spacer paragraphs and drops srcset', () => {
    expect(
      cleanContent(
        '<p>a</p><p>&nbsp;</p>\n<p>&nbsp;</p>\n<p> </p><img src="x.jpg" srcset="x-300.jpg 300w" sizes="100vw"><p>&nbsp;</p>',
        new Set(),
      ),
    ).toBe('<p>a</p><p>&nbsp;</p>\n<img src="x.jpg"><p>&nbsp;</p>');
  });
});

test('parseStaff tells apart same names by avatar, first listing wins', () => {
  const card = (name: string, avatar: string, posts: number) =>
    `<img alt="" src="https://secure.gravatar.com/avatar/${avatar.repeat(32)}?s=70" class="avatar avatar-70">` +
    `<div class="td-authors-name"><a href="#">${name}</a></div><span class="td-author-post-count">${posts} POSTS</span>`;
  const block = (title: string, ...cards: string[]) =>
    `<span class="td-pulldown-size">${title}</span>${cards.join('')}`;
  const html =
    `<div id="editor">${block('편집장', card('다연 이', 'a', 7))}</div>` +
    `<div id="reporter">${block('정기자', card('다연 이', 'b', 0), card('지원 박', 'c', 0))}</div>` +
    `<div id="webmaster">${block('웹마스터', card('도현 김', 'd', 0))}</div>` +
    `<div id="left">${block('거쳐간 사람들', card('지원 박', 'c', 0), card('희주 강', 'e', 3))}</div>`;
  expect(
    parseStaff(html).map(({ name, role, posts }) => [name, role, posts]),
  ).toEqual([
    ['다연 이', Role.EDITOR_IN_CHIEF, 7],
    ['다연 이', Role.REPORTING_REPORTER, 0],
    ['지원 박', Role.REPORTING_REPORTER, 0],
    ['희주 강', Role.ALUMNI, 3],
  ]);
});

test('decodeEntities handles WordPress title entities', () => {
  expect(
    decodeEntities('지스트신문 &#8211; 제72호 &amp; &#x2018;택배&#8217;'),
  ).toBe('지스트신문 – 제72호 & ‘택배’');
  expect(decodeEntities('&unknown;')).toBe('&unknown;');
});

test('fromGmt reads the value as UTC', () => {
  expect(fromGmt('2026-11-10T07:39:17').toISOString()).toBe(
    '2026-11-10T07:39:17.000Z',
  );
});

describe('newspapers', () => {
  test('picks the outlined PDF of each issue', () => {
    expect(toNewspaperIssue('지스트신문-제12호-아웃라인화.pdf')).toBe(12);
    expect(toNewspaperIssue('지스트신문-41호-아웃라인화.pdf')).toBe(41);
    expect(toNewspaperIssue('49호_아웃라인화.pdf')).toBe(49);
    expect(toNewspaperIssue('지스트신문-창간호-아웃라인화.pdf')).toBe(1);
    expect(toNewspaperIssue('창간준비호.pdf')).toBe(0);
    expect(toNewspaperIssue('지스트신문-제12호.pdf')).toBeNull();
    expect(toNewspaperIssue('지스트신문-제98호-아웃라인화.pdf')).toBeNull();
    expect(toNewspaperIssue('64.pdf')).toBeNull();
  });

  test('titles and dates issues, interpolating unknown ones', () => {
    expect(newspaperTitle(1)).toBe('창간호');
    expect(newspaperTitle(23)).toBe('제23호');
    expect(newspaperDate(24)?.toISOString()).toBe('2019-03-11T00:00:00.000Z');
    expect(newspaperDate(73)).toBeNull();
    expect(newspaperDate(2)?.toISOString()).toBe('2016-05-06T00:00:00.000Z');
  });
});
