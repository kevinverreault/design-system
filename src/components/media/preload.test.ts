import { describe, expect, test } from 'vitest';
import { neighbours } from './preload';

describe('neighbours', () => {
  test('picks the photo after and the photo before', () => {
    expect(neighbours(3, 10, 2)).toEqual([4, 2]);
  });

  test('splits the count both ways, nearest first, giving an odd one out to the photos after', () => {
    expect(neighbours(5, 10, 4)).toEqual([6, 4, 7, 3]);
    expect(neighbours(5, 10, 3)).toEqual([6, 4, 7]);
    expect(neighbours(5, 10, 1)).toEqual([6]);
  });

  test('picks nothing for a count of 0', () => {
    expect(neighbours(5, 10, 0)).toEqual([]);
  });

  test('wraps around at both ends, like stepping', () => {
    expect(neighbours(9, 10, 2)).toEqual([0, 8]);
    expect(neighbours(0, 10, 4)).toEqual([1, 9, 2, 8]);
  });

  test('stops at the Gallery\'s other photos, without repeating one', () => {
    expect(neighbours(0, 3, 4)).toEqual([1, 2]);
    expect(neighbours(1, 4, 10)).toEqual([2, 0, 3]);
    expect(neighbours(0, 2, 2)).toEqual([1]);
  });

  test('picks nothing in a Gallery of one photo', () => {
    expect(neighbours(0, 1, 2)).toEqual([]);
  });
});
