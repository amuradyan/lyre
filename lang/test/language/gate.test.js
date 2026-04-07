import { strict as assert } from 'assert';
import { evaluate } from '../../src/language/evaluator.js';
import { tokenize, desugar } from '../../src/language/tokenizer.js';

const eval_ = (code) => evaluate(desugar(tokenize(code))[0]);

console.log('Testing gate...');

const sampleRate = globalThis.SAMPLE_RATE || 48000;

const g = eval_("(gate 1.0 (sine 440))");
assert(g && typeof g.next === 'function', '(gate 1.0 (sine 440)) should return a generator');

const first = g.next().value;
assert(Array.isArray(first) && first.length === 3, 'gate should yield tupled output');
assert.equal(first[1], 0, 'first sample should have n=0');
assert.equal(first[2], sampleRate, 'totalSamples should match gate duration');

const half = eval_("(gate 0.5 (sine 440))");
let count = 0;
for (const _ of half) count++;
assert.equal(count, sampleRate * 0.5, '(gate 0.5 ...) should yield exactly sampleRate * 0.5 samples');

const cut = eval_("(gate 0.1 (envelope 0.01 0.4 0.6 0.5 2.0 (sine 440)))");
let cutCount = 0;
for (const _ of cut) cutCount++;
assert.equal(cutCount, sampleRate * 0.1, 'gate should cut envelope short');

const lfo = eval_("(gate 0.5 (sine 5))");
let lfoCount = 0;
for (const _ of lfo) lfoCount++;
assert.equal(lfoCount, sampleRate * 0.5, 'gate should work as finite LFO source');

console.log('All gate tests passed!');
