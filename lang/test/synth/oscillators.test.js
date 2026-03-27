import { strict as assert } from 'assert';
import { oscillate, sawtooth, square, triangle, toneWith } from '../../src/synth/oscillators.js';

console.log('Testing oscillators...');

const sq = square(440);
for (let i = 0; i < 100; i++) {
  const sample = sq.next().value;
  assert(sample === 1 || sample === -1, `square wave sample should be 1 or -1, got ${sample}`);
}

const tri = triangle(440);
for (let i = 0; i < 100; i++) {
  const sample = tri.next().value;
  assert(sample >= -1 && sample <= 1, `triangle wave sample should be in [-1, 1], got ${sample}`);
}

const saw = sawtooth(440);
for (let i = 0; i < 100; i++) {
  const sample = saw.next().value;
  assert(sample >= -1 && sample <= 1, `sawtooth wave sample should be in [-1, 1], got ${sample}`);
}

const tupled = toneWith(square, 440);
const [sample, n, total] = tupled.next().value;
assert(sample === 1 || sample === -1, `toneWith(square) should yield square samples, got ${sample}`);
assert.equal(n, 0, 'toneWith first sample should have n=0');
assert.equal(total, Infinity, 'toneWith should yield Infinity as totalSamples');

const second = tupled.next().value;
assert.equal(second[1], 1, 'toneWith second sample should have n=1');

console.log('All oscillator tests passed!');
