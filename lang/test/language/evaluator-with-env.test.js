import { evaluate } from '../../src/language/evaluator.js';
import { tokenize } from '../../src/language/tokenizer.js';

console.log('Testing evaluator with environment...');

const tokens1 = tokenize("(tone 440)");
const gen1 = evaluate(tokens1[0]);
console.assert(gen1 !== null, 'evaluate should return generator for (tone 440)');

const tokens2 = tokenize("(tone C4)");
const gen2 = evaluate(tokens2[0]);
console.assert(gen2 !== null, 'evaluate should return generator for (tone C4)');

const tokens3 = tokenize("(sequence (tone G4) (tone A4))");
const gen3 = evaluate(tokens3[0]);
console.assert(gen3 !== null, 'evaluate should return generator for sequence with note names');

const tokens4 = tokenize("(harmony (tone 196.00) (tone 98.00))");
const gen4 = evaluate(tokens4[0]);
console.assert(gen4 !== null, 'evaluate should return generator for harmony with numbers');

const tokens5 = tokenize("(harmony (tone G3) (tone G2))");
const gen5 = evaluate(tokens5[0]);
console.assert(gen5 !== null, 'evaluate should return generator for harmony with note names');

const tokens6 = tokenize("(envelope 0.01 0.5 0 0.01 0 (tone C4) (tone G4))");
const gen6 = evaluate(tokens6[0]);
console.assert(gen6 !== null, 'evaluate should return generator for envelope with note names');

try {
  const tokens = tokenize("(tone NotANote)");
  evaluate(tokens[0]);
  console.assert(false, 'evaluate should throw for unknown note name');
} catch (e) {
  console.assert(e.message.includes("Unknown name"), `Error should mention "Unknown name", got: ${e.message}`);
}

console.log('All evaluator with environment tests passed!');
