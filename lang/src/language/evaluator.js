import { sequence } from '../synth/composition.js';
import { lookup } from './environment.js';

const isClosure = (x) => x && typeof x === 'object' && x.kind === 'closure';

/**
 * Interprets a tokenized Lyre expression and returns a generator function.
 * @param {string|Array} expression - A tokenized expression (from tokenize) or a string number
 * @param {Array} env - Environment bindings (list of [name, value] pairs)
 * @returns {Generator|number|object} A generator yielding samples, a number, or a closure value
 * @example
 * const tokens = tokenize("(tone 440)");
 * const generator = evaluate(tokens);
 * for (const sample of generator) {
 *   // process audio sample
 * }
 */
export function evaluate(expression, env = []) {
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
        const value = evaluate(bindings[i + 1], newEnv);
        newEnv.push([name, value]);
      }

      const evaluated = bodies.map(body => evaluate(body, newEnv));
      return evaluated.length === 1 ? evaluated[0] : sequence(...evaluated);
    }

    if (operator === "patch") {
      if (!Array.isArray(operands[0])) {
        throw new Error("patch expects an args list as first operand");
      }
      if (operands.length !== 2) {
        throw new Error(`patch expects exactly one body expression; got ${operands.length - 1}`);
      }
      const args = operands[0];
      for (const arg of args) {
        if (typeof arg !== 'string') {
          throw new Error(`patch args must be symbols; got ${JSON.stringify(arg)}`);
        }
      }
      return { kind: 'closure', args, body: operands[1], env: [...env] };
    }

    const evaluated = operands.map(operand => evaluate(operand, env));
    const fn = evaluate(operator, env);

    if (typeof fn === 'function') {
      return fn(evaluated, env);
    }

    if (isClosure(fn)) {
      if (evaluated.length !== fn.args.length) {
        throw new Error(`Arity mismatch: patch expects ${fn.args.length} arg(s), got ${evaluated.length}`);
      }
      const extendedEnv = [...fn.env];
      for (let i = 0; i < fn.args.length; i++) {
        extendedEnv.push([fn.args[i], evaluated[i]]);
      }
      return evaluate(fn.body, extendedEnv);
    }

    throw new Error(`Unknown operator: ${operator}`);
  }
}
