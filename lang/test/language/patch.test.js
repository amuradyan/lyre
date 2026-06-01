import { tokenize, desugar } from '../../src/language/tokenizer.js';
import { evaluate } from '../../src/language/evaluator.js';
import { strict as assert } from 'assert';

const eval_ = (code) => evaluate(desugar(tokenize(code))[0]);

console.log('Testing patch special form...');

const closure = eval_("(patch (x) x)");
assert.equal(closure.kind, 'closure', "patch should evaluate to a closure value");
assert.deepEqual(closure.args, ['x'], "closure should carry args");
assert(closure.body !== undefined, "closure should carry body");
assert(Array.isArray(closure.env), "closure should carry captured env");

assert.equal(eval_("((patch (x y) (+ x y)) 2 3)"), 5, "applying a math patch should return the value");

const audioGen = eval_("((patch (f) (sine f)) 440)");
assert(audioGen && typeof audioGen.next === 'function', "applying an audio patch should return a generator");

assert.equal(eval_("(let (add (patch (x y) (+ x y))) (add 2 3))"), 5, "closure bound via let should be callable by name");

assert.equal(eval_("(let (k 10) (let (f (patch () k)) (f)))"), 10, "closure should capture outer let bindings");

assert.equal(eval_("(let (x 1) (let (f (patch (x) x)) (f 99)))"), 99, "arg should shadow outer binding inside body");

assert.equal(eval_("((patch () 42))"), 42, "patch with empty args should be callable with no args");

assert.throws(
  () => eval_("(let (add (patch (x y) (+ x y))) (add 1))"),
  /Arity mismatch/,
  "arity mismatch should throw"
);

assert.throws(
  () => eval_("(patch foo (x) x)"),
  /args list/,
  "non-array first operand should throw"
);

const bp = eval_("(let (bp (patch (t b s) (lowpass t (highpass b s)))) (bp 1000 500 (sine 440)))");
assert(bp && typeof bp.next === 'function', "bandpass composition should return a generator");
const firstSample = bp.next().value;
assert(Array.isArray(firstSample), "first yielded value should be a tuple");
assert(Number.isFinite(firstSample[0]), "first sample should be a finite number");

console.log('All patch tests passed!');
