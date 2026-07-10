import { test } from 'node:test';
import { ok } from 'node:assert';
import { randomElement } from './utils.js';

test('randomElement returns an element from the array', () => {
  const arr = [1, 2, 3, 4, 5];
  const result = randomElement(arr);
  ok(arr.includes(result), 'Result should be in the array');
}); 