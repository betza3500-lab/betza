import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCached,
  rowsToObjects,
  whoIsWinner,
  calculateScore,
  calculateScoreFinale,
  calculateScoreSchiftingsvraag,
  parseCommaSeparated
} from '../modules/googlesheet.js';

test('getCached stores computed value and reuses cache on repeated calls', async () => {
  const cacheKey = `unit-test-${Date.now()}-${Math.random()}`;
  let calls = 0;
  const fetchFn = async () => {
    calls += 1;
    return { value: 42 };
  };

  const first = await getCached(cacheKey, fetchFn);
  const second = await getCached(cacheKey, fetchFn);

  assert.deepEqual(first, { value: 42 });
  assert.deepEqual(second, { value: 42 });
  assert.equal(calls, 1);
});

test('rowsToObjects maps rows using headers', () => {
  const rows = [{ id: '1', name: ' Alice ' }, { id: '2', name: ' Bob ' }];
  const result = rowsToObjects(rows, ['id', 'name']);
  assert.deepEqual(result, [
    { id: '1', name: ' Alice ' },
    { id: '2', name: ' Bob ' }
  ]);
});

test('rowsToObjects trims values when trim flag is enabled', () => {
  const rows = [{ id: '1 ', name: ' Alice ' }];
  const result = rowsToObjects(rows, ['id', 'name'], true);
  assert.deepEqual(result, [{ id: '1', name: 'Alice' }]);
});

test('whoIsWinner returns home, away and draw correctly', () => {
  assert.equal(whoIsWinner('2-1'), 'home');
  assert.equal(whoIsWinner('1-3'), 'away');
  assert.equal(whoIsWinner('0-0'), 'draw');
});

test('calculateScore returns zero when no match result is available', () => {
  assert.equal(calculateScore(undefined, '2-1', false, false), 0);
});

test('calculateScore awards winner points and joker bonus for Belgium games', () => {
  assert.equal(calculateScore('2-1', '3-2', true, true), 3);
});

test('calculateScore awards exact score points and joker bonus', () => {
  assert.equal(calculateScore('2-1', '2-1', false, true), 4);
});

test('calculateScore awards exact Belgium score without joker', () => {
  assert.equal(calculateScore('2-1', '2-1', true, false), 4);
});

test('calculateScore returns zero for wrong prediction', () => {
  assert.equal(calculateScore('2-1', '1-2', false, false), 0);
});

test('calculateScoreFinale applies AF tiered scoring', () => {
  const finalisten = Array.from({ length: 16 }, (_, i) => `T${i}`);
  assert.equal(calculateScoreFinale('AF', finalisten, finalisten.slice(0, 8)), 8);
  assert.equal(calculateScoreFinale('AF', finalisten, finalisten.slice(0, 10)), 12);
  assert.equal(calculateScoreFinale('AF', finalisten, finalisten.slice(0, 15)), 24);
});

test('calculateScoreFinale applies KF tiered scoring', () => {
  const finalisten = Array.from({ length: 8 }, (_, i) => `T${i}`);
  assert.equal(calculateScoreFinale('KF', finalisten, finalisten.slice(0, 4)), 8);
  assert.equal(calculateScoreFinale('KF', finalisten, finalisten.slice(0, 5)), 11);
  assert.equal(calculateScoreFinale('KF', finalisten, finalisten.slice(0, 7)), 18);
});

test('calculateScoreFinale applies HF scoring thresholds', () => {
  const finalisten = ['A', 'B', 'C', 'D'];
  assert.equal(calculateScoreFinale('HF', finalisten, ['A', 'B']), 8);
  assert.equal(calculateScoreFinale('HF', finalisten, ['A', 'B', 'C']), 13);
  assert.equal(calculateScoreFinale('HF', finalisten, ['A', 'B', 'C', 'D']), 19);
});

test('calculateScoreFinale applies F1 and Winnaar scoring', () => {
  const finalisten = ['A', 'B'];
  assert.equal(calculateScoreFinale('F1', finalisten, ['A']), 5);
  assert.equal(calculateScoreFinale('F1', finalisten, ['A', 'B']), 11);
  assert.equal(calculateScoreFinale('Winnaar', ['A'], ['A']), 6);
});

test('calculateScoreFinale maps Belgium progression stages to correct points', () => {
  assert.equal(calculateScoreFinale('België', ['AF'], ['AF']), 3);
  assert.equal(calculateScoreFinale('België', ['Winnaar'], ['Winnaar']), 10);
});

test('calculateScoreFinale returns zero for invalid or empty inputs', () => {
  assert.equal(calculateScoreFinale('AF', [], ['A']), 0);
  assert.equal(calculateScoreFinale('UNKNOWN', ['A'], ['A']), 0);
});

test('calculateScoreSchiftingsvraag currently returns zero', async () => {
  assert.equal(await calculateScoreSchiftingsvraag('10', '12'), 0);
});

test('parseCommaSeparated handles empty, undefined and trimmed values', () => {
  assert.deepEqual(parseCommaSeparated(undefined), []);
  assert.deepEqual(parseCommaSeparated(''), []);
  assert.deepEqual(parseCommaSeparated('A, B ,C'), ['A', 'B', 'C']);
});
