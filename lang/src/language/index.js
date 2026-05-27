/**
 * @module language
 * Lyre language parsing and evaluation
 */

/**
 * Tokenize Lyre code into expression tree
 */
export { tokenize } from './tokenizer.js';

/**
 * Evaluate tokenized expressions into generators
 */
export { evaluate } from './evaluator.js';

/**
 * Expand syntax sugar for a tokenized source
 */
export { desugar } from './tokenizer.js';

/**
 * Read a file, evaluate it, and yield the resulting sample stream
 */
export { compute, stream } from './runner.js';
