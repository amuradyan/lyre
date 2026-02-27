import { tone } from '../synth/oscillators.js';
import { envelope, gain } from '../synth/envelopes.js';
import { sequence, harmony } from '../synth/composition.js';
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

    const evaluated = operands.map(operand => interpret(operand, env));

    switch (operator) {
      case "tone":
        const [frequency] = evaluated;
        return tone(frequency);
      case "envelope":
        const [attackTime, decayTime, sustainLevel, releaseTime, gateTime, ...sources] = evaluated;
        const enveloped =
          sources.map(source =>
            envelope(source, attackTime, decayTime, sustainLevel, releaseTime, gateTime));
        return sequence(...enveloped);
      case "sequence":
        return sequence(...evaluated);
      case "harmony":
        return harmony(...evaluated);
      case "gain":
        const [signal, level] = evaluated;
        return gain(signal, level);
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }
}
