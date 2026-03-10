import { tokenize } from '../../src/language/tokenizer.js';
import { strict as assert } from 'assert';

console.log('Testing tokenizer...');

assert.deepEqual(
  tokenize("(tone 440)"),
  [["tone", "440"]],
  "Basic expression"
);

assert.deepEqual(
  tokenize("(tone 440) ; this is a comment"),
  [["tone", "440"]],
  "Comment at end of expression"
);

assert.deepEqual(
  tokenize("(sequence\n  ; first note\n  (tone 440))"),
  [["sequence", ["tone", "440"]]],
  "Comment on its own line"
);

assert.deepEqual(
  tokenize("(sequence\n  ; first note\n  (tone 440)\n  ; second note\n  (tone 880))"),
  [["sequence", ["tone", "440"], ["tone", "880"]]],
  "Multiple comments"
);

assert.deepEqual(
  tokenize("(tone 440) ; comment with (parens) and symbols!@#"),
  [["tone", "440"]],
  "Comment with special characters"
);

assert.deepEqual(
  tokenize("(envelope\n  ; parameters:\n  (tone 440)\n  0.05 0.1 0.9 0.1)"),
  [["envelope", ["tone", "440"], "0.05", "0.1", "0.9", "0.1"]],
  "Comment mid-expression"
);

assert.deepEqual(
  tokenize("(tone 440) ;"),
  [["tone", "440"]],
  "Empty comment"
);

assert.deepEqual(
  tokenize("; intro comment\n(tone 440)"),
  [["tone", "440"]],
  "Comment at start of file"
);

assert.deepEqual(
  tokenize("; comment 1\n; comment 2\n(tone 440)"),
  [["tone", "440"]],
  "Multiple comment-only lines"
);

assert.deepEqual(
  tokenize("(sequence\n  (harmony\n    ; voices\n    (tone 440)\n    (tone 880)))"),
  [["sequence", ["harmony", ["tone", "440"], ["tone", "880"]]]],
  "Comment in nested expression"
);

assert.deepEqual(
  tokenize("(tone 261.63) (tone 329.63) (tone 392.00)"),
  [["tone", "261.63"], ["tone", "329.63"], ["tone", "392.00"]],
  "Multiple top-level expressions"
);

assert.deepEqual(
  tokenize("(tone 261.63) | (tone 329.63) | (tone 392.00)"),
  [["tone", "261.63"], ["tone", "329.63"], ["tone", "392.00"]],
  "Expressions split with bars"
);

console.log('All tests passed!');
