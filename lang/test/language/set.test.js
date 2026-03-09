import { interpret } from '../../src/language/evaluator.js';
import { tokenize } from '../../src/language/tokenizer.js';

console.log('Testing set! special form...');

const env = [];
const tokens1 = tokenize("(set! middle-c 261.63)");
const result1 = interpret(tokens1[0], env);
console.assert(typeof result1.next === 'function', `set! should return a generator`);
console.assert(result1.next().done === true, `set! generator should be empty`);
console.assert(env.length === 1, `env should have 1 binding, got: ${env.length}`);
console.assert(env[0][0] === "middle-c", `binding name should be "middle-c", got: ${env[0][0]}`);
console.assert(env[0][1] === 261.63, `binding value should be 261.63, got: ${env[0][1]}`);

const tokens2 = tokenize("(tone middle-c)");
const gen2 = interpret(tokens2[0], env);
console.assert(gen2 !== null, 'interpret should return generator for (tone middle-c) after set!');

const tokens3 = tokenize("(set! my-note C4)");
const result3 = interpret(tokens3[0], env);
console.assert(typeof result3.next === 'function', `set! should return a generator`);
console.assert(env.length === 2, `env should have 2 bindings, got: ${env.length}`);
console.assert(env[1][1] === 261.63, `my-note should resolve to 261.63, got: ${env[1][1]}`);

const tokens4 = tokenize("(set! middle-c 440)");
const result4 = interpret(tokens4[0], env);
console.assert(env[0][1] === 440, `middle-c should be overridden to 440, got: ${env[0][1]}`);
console.assert(env.length === 2, `env should still have 2 bindings after override, got: ${env.length}`);

const tokens5 = tokenize("(tone middle-c)");
const gen5 = interpret(tokens5[0], env);
console.assert(gen5 !== null, 'interpret should return generator for updated middle-c');

console.log('All set! tests passed!');