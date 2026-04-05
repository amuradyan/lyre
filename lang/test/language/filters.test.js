import { strict as assert } from 'assert';
import { evaluate } from '../../src/language/evaluator.js';
import { tokenize, desugar } from '../../src/language/tokenizer.js';

const eval_ = (code) => evaluate(desugar(tokenize(code))[0]);

console.log('Testing filters...');

const lp = eval_("(lowpass 2000 (sawtooth 440))");
assert(lp && typeof lp.next === 'function', '(lowpass 2000 (sawtooth 440)) should return a generator');
const lpSample = lp.next().value;
assert(Array.isArray(lpSample) && lpSample.length === 3, 'lowpass should yield tupled output');

const hp = eval_("(highpass 500 (sawtooth 440))");
assert(hp && typeof hp.next === 'function', '(highpass 500 (sawtooth 440)) should return a generator');
const hpSample = hp.next().value;
assert(Array.isArray(hpSample) && hpSample.length === 3, 'highpass should yield tupled output');

const lpGen = eval_("(lowpass (dc 2000) (sawtooth 440))");
assert(lpGen && typeof lpGen.next === 'function', 'lowpass with generator cutoff should return a generator');

const multi = eval_("(lowpass 2000 (sine C4) (sine E4))");
assert(multi && typeof multi.next === 'function', 'lowpass with multiple sources should return a generator');

console.log('All filter tests passed!');
