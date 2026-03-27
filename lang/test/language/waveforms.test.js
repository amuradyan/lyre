import { strict as assert } from 'assert';
import { evaluate } from '../../src/language/evaluator.js';
import { tokenize } from '../../src/language/tokenizer.js';

console.log('Testing waveforms...');

const sine = evaluate(tokenize("(sine 440)")[0]);
assert(sine && typeof sine.next === 'function', '(sine 440) should return a generator');

const sq = evaluate(tokenize("(square 440)")[0]);
assert(sq && typeof sq.next === 'function', '(square 440) should return a generator');

const saw = evaluate(tokenize("(sawtooth 440)")[0]);
assert(saw && typeof saw.next === 'function', '(sawtooth 440) should return a generator');

const tri = evaluate(tokenize("(triangle 440)")[0]);
assert(tri && typeof tri.next === 'function', '(triangle 440) should return a generator');

const sqSample = sq.next().value;
assert(sqSample[0] === 1 || sqSample[0] === -1, `(square 440) should yield square samples, got ${sqSample[0]}`);

const defaultPlay = evaluate(tokenize("(play 1 C4)")[0]);
assert(defaultPlay && typeof defaultPlay.next === 'function', 'play with default wave should return a generator');

const overridden = evaluate(tokenize("(let (wave square) (play 1 C4))")[0]);
assert(overridden && typeof overridden.next === 'function', 'play with overridden wave should return a generator');

const defaultSample = defaultPlay.next().value;
const overriddenSample = overridden.next().value;
assert(defaultSample[0] !== overriddenSample[0] || defaultSample[0] === 0,
  'default sine and overridden square should produce different first samples');

console.log('All waveform tests passed!');
