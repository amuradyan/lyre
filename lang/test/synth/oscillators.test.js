import { strict as assert } from 'assert';
import { raw, wrap, modulate } from '../../src/synth/oscillators.js';

console.log('Testing oscillators...');

const sq = raw.square(440);
for (let i = 0; i < 100; i++) {
  const sample = sq.next().value;
  assert(sample === 1 || sample === -1, `square wave sample should be 1 or -1, got ${sample}`);
}

const tri = raw.triangle(440);
for (let i = 0; i < 100; i++) {
  const sample = tri.next().value;
  assert(sample >= -1 && sample <= 1, `triangle wave sample should be in [-1, 1], got ${sample}`);
}

const saw = raw.sawtooth(440);
for (let i = 0; i < 100; i++) {
  const sample = saw.next().value;
  assert(sample >= -1 && sample <= 1, `sawtooth wave sample should be in [-1, 1], got ${sample}`);
}

const wrapped = wrap(raw.square, 440);
const [sample, n, total] = wrapped.next().value;
assert(sample === 1 || sample === -1, `wrap(raw.square) should yield square samples, got ${sample}`);
assert.equal(n, 0, 'wrap first sample should have n=0');
assert.equal(total, Infinity, 'wrap should yield Infinity as totalSamples');

const second = wrapped.next().value;
assert.equal(second[1], 1, 'wrap second sample should have n=1');

const constant = wrap(raw.dc, 1);
const [dcSample, dcN, dcTotal] = constant.next().value;
assert.equal(dcSample, 1, 'dc(1) should yield 1');
assert.equal(dcN, 0, 'dc first sample should have n=0');
assert.equal(dcTotal, Infinity, 'dc should yield Infinity as totalSamples');

const dcSecond = constant.next().value;
assert.equal(dcSecond[0], 1, 'dc(1) should still yield 1');
assert.equal(dcSecond[1], 1, 'dc second sample should have n=1');

// atPhase formulas at known phases
assert.equal(raw.sine.atPhase(0), 0, 'sine at phase 0 should be 0');
assert(Math.abs(raw.sine.atPhase(Math.PI / 2) - 1) < 1e-10, 'sine at π/2 should be 1');
assert(Math.abs(raw.sine.atPhase(Math.PI)) < 1e-10, 'sine at π should be 0');

assert.equal(raw.sawtooth.atPhase(0), -1, 'sawtooth at phase 0 should be -1');
assert(Math.abs(raw.sawtooth.atPhase(Math.PI)) < 1e-10, 'sawtooth at π should be 0');

assert.equal(raw.square.atPhase(0), 1, 'square at phase 0 should be 1');
assert.equal(raw.square.atPhase(Math.PI), -1, 'square at phase π should be -1');

assert.equal(raw.triangle.atPhase(0), -1, 'triangle at phase 0 should be -1');
assert.equal(raw.triangle.atPhase(Math.PI), 1, 'triangle at phase π should be 1');

// modulate with a constant freq generator should match fixed-frequency wrap
function* constFreq(freq) {
  while (true) yield [freq, 0, Infinity];
}

const fixed = wrap(raw.sine, 440);
const modulated = wrap(raw.sine, constFreq(440));
for (let i = 0; i < 50; i++) {
  const f = fixed.next().value[0];
  const m = modulated.next().value[0];
  assert(Math.abs(f - m) < 1e-10, `sample ${i}: fixed=${f}, modulated=${m}`);
}

// modulate stops when freq generator stops
function* gatedFreq(freq, count) {
  for (let i = 0; i < count; i++) yield [freq, i, count];
}

const gated = wrap(raw.sine, gatedFreq(440, 100));
let gatedCount = 0;
for (const _ of gated) gatedCount++;
assert.equal(gatedCount, 100, 'wrap should stop when freq generator stops');

console.log('All oscillator tests passed!');
