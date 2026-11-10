import { Category } from '../libs/drizzle/src/enum';
import {
  decodeEntities,
  formatName,
  fromGmt,
  toCategories,
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
