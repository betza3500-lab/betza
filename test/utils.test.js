import test from 'node:test';
import assert from 'node:assert/strict';
import { pickHighest, pickLowest } from '../modules/utils.js';

test('pickHighest returns highest value by default', () => {
  const result = pickHighest({ a: 2, b: 9, c: 4 });
  assert.deepEqual(result, { b: 9 });
});

test('pickHighest returns top N values in descending order', () => {
  const result = pickHighest({ a: 2, b: 9, c: 4, d: 1 }, 2);
  assert.deepEqual(result, { b: 9, c: 4 });
});

test('pickHighest returns false when N exceeds object size', () => {
  const result = pickHighest({ a: 1 }, 2);
  assert.equal(result, false);
});

test('pickLowest returns lowest value by default', () => {
  const result = pickLowest({ a: 2, b: 9, c: 1 });
  assert.deepEqual(result, { c: 1 });
});

test('pickLowest returns bottom N values in ascending order', () => {
  const result = pickLowest({ a: 2, b: 9, c: 4, d: 1 }, 2);
  assert.deepEqual(result, { d: 1, a: 2 });
});

test('pickLowest returns false when N exceeds object size', () => {
  const result = pickLowest({ a: 1 }, 3);
  assert.equal(result, false);
});
