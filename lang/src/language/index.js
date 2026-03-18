/**
 * @module language
 * Lyre language parsing and interpretation
 */

/**
 * Tokenize Lyre code into expression tree
 */
export { tokenize } from './tokenizer.js';

/**
 * Interpret tokenized expressions into generators
 */
export { interpret } from './evaluator.js';

/**
 * Expand syntax sugar for a tokenized source
 */
export { desugar } from './tokenizer.js';
