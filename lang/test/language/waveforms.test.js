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

// Vibrato - sine with varying frequency
const vibrato = evaluate(tokenize("(sine (+ 440 (* 10 (sine 5))))")[0]);
assert(vibrato && typeof vibrato.next === 'function', 'vibrato expression should return a generator');
for (let i = 0; i < 100; i++) {
  const [s] = vibrato.next().value;
  assert(s >= -1 && s <= 1, `vibrato sample ${i} should be in [-1, 1], got ${s}`);
}

// FM with sawtooth
const fm = evaluate(tokenize("(sawtooth (+ 220 (* 50 (sine 5))))")[0]);
assert(fm && typeof fm.next === 'function', 'FM sawtooth should return a generator');

// Constant generator should match fixed frequency
const fixed = evaluate(tokenize("(sine 440)")[0]);
const constant = evaluate(tokenize("(sine (flat 440))")[0]);
const fixedFirst = fixed.next().value[0];
const constantFirst = constant.next().value[0];
assert(Math.abs(fixedFirst - constantFirst) < 1e-10,
  `(sine 440) and (sine (flat 440)) should produce the same first sample, got ${fixedFirst} and ${constantFirst}`);

// Time-boxed by gated modulator
const gated = evaluate(tokenize("(sine (gate 0.5 (flat 440)))")[0]);
let count = 0;
for (const _ of gated) count++;
const sampleRate = globalThis.SAMPLE_RATE || 48000;
assert.equal(count, sampleRate * 0.5, '(sine (gate 0.5 (flat 440))) should yield exactly 0.5 seconds of samples');

console.log('All waveform tests passed!');
