import { strict as assert } from 'assert';
import { evaluate } from '../../src/language/evaluator.js';
import { tokenize, desugar } from '../../src/language/tokenizer.js';

const eval_ = (code) => evaluate(desugar(tokenize(code))[0]);

console.log('Testing arithmetic operators...');

assert.equal(eval_("(+ 3 5)"), 8, "(+ 3 5) should be 8");
assert.equal(eval_("(- 10 3)"), 7, "(- 10 3) should be 7");
assert.equal(eval_("(* 4 5)"), 20, "(* 4 5) should be 20");
assert.equal(eval_("(/ 20 4)"), 5, "(/ 20 4) should be 5");

assert.equal(eval_("(+ (* 3 4) (- 10 5))"), 17, "nested arithmetic");

const gen1 = eval_("(+ (sine 440) 0.5)");
assert(gen1 && typeof gen1.next === 'function', "(+ generator number) should return a generator");
const sample1 = gen1.next().value;
assert.equal(sample1[0], 0.5, "sine starts at 0, so + 0.5 should give 0.5");
assert.equal(sample1[2], Infinity, "should preserve Infinity totalSamples");

const gen2 = eval_("(* (sine 440) 0.5)");
assert(gen2 && typeof gen2.next === 'function', "(* generator number) should return a generator");
const sample2 = gen2.next().value;
assert.equal(sample2[0], 0, "sine starts at 0, * 0.5 is still 0");

const gen3 = eval_("(+ (sine 440) (sine 440))");
assert(gen3 && typeof gen3.next === 'function', "(+ generator generator) should return a generator");
const sample3 = gen3.next().value;
assert.equal(sample3[0], 0, "two sines at phase 0 summed = 0");

console.log('All arithmetic tests passed!');
