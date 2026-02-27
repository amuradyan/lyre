import { lookup } from '../../src/language/environment.js';

console.log('Testing environment lookup...');

const c4 = lookup("C4");
console.assert(c4 === 261.63, `lookup("C4") should return 261.63, got ${c4}`);

const g4 = lookup("G4");
console.assert(g4 === 392.00, `lookup("G4") should return 392.00, got ${g4}`);

const a4 = lookup("A4");
console.assert(a4 === 440.00, `lookup("A4") should return 440.00, got ${a4}`);

const eb3 = lookup("Eb3");
console.assert(eb3 === 155.56, `lookup("Eb3") should return 155.56, got ${eb3}`);

try {
  lookup("NotANote");
  console.assert(false, 'lookup("NotANote") should throw an error');
} catch (e) {
  console.assert(e.message.includes("Unknown name"), `Error message should mention "Unknown name", got: ${e.message}`);
}

const customEnv = [["X", 999]];
const x = lookup("X", customEnv);
console.assert(x === 999, `lookup("X", customEnv) should return 999, got ${x}`);

const c4FromCustom = lookup("C4", customEnv);
console.assert(c4FromCustom === 261.63, `lookup("C4", customEnv) should still find C4 in prelude, got ${c4FromCustom}`);

console.log('All environment tests passed!');
