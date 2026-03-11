import { tokenize } from '../../src/language/tokenizer.js';
import { interpret } from '../../src/language/evaluator.js';
import { strict as assert } from 'assert';

console.log('Testing let special form...');

const expr1 = tokenize("(let (x 5) x)")[0];
const result1 = interpret(expr1);
assert.equal(result1, 5, "let should bind x to 5 and return it");

const expr2 = tokenize("(let (x 5 y 10) y)")[0];
const result2 = interpret(expr2);
assert.equal(result2, 10, "let should bind multiple variables");

const expr3 = tokenize("(let (x 5 y x) y)")[0];
const result3 = interpret(expr3);
assert.equal(result3, 5, "later bindings should be able to reference earlier ones");

const env = [["x", 100], ["C4", 261.63]];
const expr4 = tokenize("(let (x 5) x)")[0];
const result4 = interpret(expr4, env);
assert.equal(result4, 5, "let should shadow outer bindings");
assert.equal(env[0][1], 100, "outer binding should remain unchanged");

const expr5 = tokenize("(let (freq 440) (tone freq))")[0];
const gen = interpret(expr5);
assert(gen && typeof gen.next === 'function', "let body should return generator from tone");

const expr6 = tokenize("(let (freq C4) (tone freq))")[0];
const gen2 = interpret(expr6);
assert(gen2 && typeof gen2.next === 'function', "let should resolve C4 from environment");

const expr7 = tokenize("(let (x 5) (let (y 10) y))")[0];
const result7 = interpret(expr7);
assert.equal(result7, 10, "nested let should work");

const expr8 = tokenize("(let (notes -(C4 E4 G4)) notes)")[0];
const desugared = [
  "let",
  ["notes", "-", ["C4", "E4", "G4"]],
  "notes"
];

console.log('All let tests passed!');
