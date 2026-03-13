import { desugar } from '../../src/language/tokenizer.js';
import { strict as assert } from 'assert';

console.log('Testing desugar...');

// -(A2 E3)
assert.deepEqual(
  desugar(["-", ["A2", "E3"]]),
  [["sequence", "A2", "E3"]],
  "Desugar sequence operator"
);

// =(C4 E4 G4)
assert.deepEqual(
  desugar(["=", ["C4", "E4", "G4"]]),
  [["harmony", "C4", "E4", "G4"]],
  "Desugar harmony operator"
);

// -(A2 E3) -(F4 G5)
assert.deepEqual(
  desugar(["-", ["A2", "E3"], "-", ["F4", "G5"]]),
  [["sequence", "A2", "E3"], ["sequence", "F4", "G5"]],
  "Desugar multiple sequences"
);

// =(C4 E4) =(F4 A4)
assert.deepEqual(
  desugar(["=", ["C4", "E4"], "=", ["F4", "A4"]]),
  [["harmony", "C4", "E4"], ["harmony", "F4", "A4"]],
  "Desugar multiple harmonies"
);

// (tone 440)
assert.deepEqual(
  desugar([["tone", "440"]]),
  [["tone", "440"]],
  "Leave regular expressions unchanged"
);

// -(A2) (tone 440) =(C4)
assert.deepEqual(
  desugar(["-", ["A2"], ["tone", "440"], "=", ["C4"]]),
  [["sequence", "A2"], ["tone", "440"], ["harmony", "C4"]],
  "Mixed sugar and regular expressions"
);

assert.deepEqual(
  desugar(["-", "not-an-array", "=", "also-not-array"]),
  ["-", "not-an-array", "=", "also-not-array"],
  "Don't expand if not followed by array"
);

// -(=(C4 E4) =(F4 A4))
assert.deepEqual(
  desugar(["-", ["=", ["C4", "E4"], "=", ["F4", "A4"]]]),
  [["sequence", ["harmony", "C4", "E4"], ["harmony", "F4", "A4"]]],
  "Nested sugar: sequence containing harmonies"
);

// =(-(A2 E3) -(F4 G5))
assert.deepEqual(
  desugar(["=", ["-", ["A2", "E3"], "-", ["F4", "G5"]]]),
  [["harmony", ["sequence", "A2", "E3"], ["sequence", "F4", "G5"]]],
  "Nested sugar: harmony containing sequences"
);

// -(-(A2) =(C4 E4))
assert.deepEqual(
  desugar(["-", ["-", ["A2"], "=", ["C4", "E4"]]]),
  [["sequence", ["sequence", "A2"], ["harmony", "C4", "E4"]]],
  "Deeply nested mixed sugar"
);

// -(=(-((tone 440))))
assert.deepEqual(
  desugar(["-", ["=", ["-", [["tone", "440"]]]]]),
  [["sequence", ["harmony", ["sequence", ["tone", "440"]]]]],
  "Triple nested sugar"
);

// (envelope - (A2 E3)) - sugar expands inside nested arrays too
assert.deepEqual(
  desugar([["envelope", "-", ["A2", "E3"]]]),
  [["envelope", ["sequence", "A2", "E3"]]],
  "Sugar operators inside nested expressions are expanded"
);

// (let (. 0.5) -(A2 E3))
assert.deepEqual(
  desugar([["let", [".", "0.5"], "-", ["A2", "E3"]]]),
  [["let", [".", "0.5"], ["sequence", "A2", "E3"]]],
  "Sugar inside let expression"
);

// -()
assert.deepEqual(
  desugar(["-", []]),
  [["sequence"]],
  "Empty sequence sugar"
);

// =()
assert.deepEqual(
  desugar(["=", []]),
  [["harmony"]],
  "Empty harmony sugar"
);

// -((tone 440)) =((tone 880)) (envelope 0.1 0.2)
assert.deepEqual(
  desugar(["-", [["tone", "440"]], "=", [["tone", "880"]], ["envelope", "0.1", "0.2"]]),
  [["sequence", ["tone", "440"]], ["harmony", ["tone", "880"]], ["envelope", "0.1", "0.2"]],
  "Mixed sugar and regular at top level"
);

// -((tone 440) (tone 880))
assert.deepEqual(
  desugar(["-", [["tone", "440"], ["tone", "880"]]]),
  [["sequence", ["tone", "440"], ["tone", "880"]]],
  "Sequence with nested regular expressions"
);

// =((envelope 0.1) -(A2))
assert.deepEqual(
  desugar(["=", [["envelope", "0.1"], "-", ["A2"]]]),
  [["harmony", ["envelope", "0.1"], ["sequence", "A2"]]],
  "Harmony with mixed regular and sugar expressions"
);

console.log('All desugar tests passed!');
