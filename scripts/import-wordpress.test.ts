import { Category } from '../libs/drizzle/src/enum';
import { decodeEntities, fromGmt, toCategories } from './import-wordpress';

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
