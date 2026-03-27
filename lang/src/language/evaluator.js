import { sequence } from '../synth/composition.js';
import { lookup } from './environment.js';

/**
 * Interprets a tokenized Lyre expression and returns a generator function.
 * @param {string|Array} expression - A tokenized expression (from tokenize) or a string number
 * @param {Array} env - Environment bindings (list of [name, value] pairs)
 * @returns {Generator|number} A generator that yields audio samples, or a number if the expression is a string
 * @example
 * const tokens = tokenize("(tone 440)");
 * const generator = interpret(tokens);
 * for (const sample of generator) {
 *   // process audio sample
 * }
 */
export function interpret(expression, env = []) {
  if (typeof expression === 'string') {
    const num = parseFloat(expression);
    if (!isNaN(num)) {
      return num;
    }

    return lookup(expression, env);
  } else {
    const [operator, ...operands] = expression;

    if (operator === "let") {
      const [bindings, ...bodies] = operands;

      const newEnv = [...env];

      for (let i = 0; i < bindings.length; i += 2) {
        const name = bindings[i];
        const value = interpret(bindings[i + 1], newEnv);
        newEnv.push([name, value]);
      }

      const evaluated = bodies.map(body => interpret(body, newEnv));
      return evaluated.length === 1 ? evaluated[0] : sequence(...evaluated);
    }

    const evaluated = operands.map(operand => interpret(operand, env));
    const fn = lookup(operator, env);

    if (typeof fn === 'function') {
      return fn(evaluated, env);
    }

    throw new Error(`Unknown operator: ${operator}`);
  }
}
