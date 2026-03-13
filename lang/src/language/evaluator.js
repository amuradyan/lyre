import { tone } from '../synth/oscillators.js';
import { envelope, gain } from '../synth/envelopes.js';
import { sequence, harmony, mix } from '../synth/composition.js';
import { lookup } from './environment.js';

const isDotOrColon = (ch) => ch === '.' || ch === ':';

const countDuration = (chars) =>
  chars.reduce((sum, ch) => sum + (ch === '.' ? 1 : 2), 0);

function parseDotNotation(token) {
  const chars = [...token];
  const prefix = [];
  const suffix = [];

  while (chars.length > 0 && isDotOrColon(chars[0]))
    prefix.push(chars.shift());

  while (chars.length > 0 && isDotOrColon(chars[chars.length - 1]))
    suffix.push(chars.pop());

  const name = chars.join('');

  if (name.length === 0 || (prefix.length === 0 && suffix.length === 0))
    return null;

  return {
    name,
    left: prefix.length > 0 ? countDuration(prefix) : 1,
    right: suffix.length > 0 ? countDuration(suffix) : 1
  };
}

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

    const note = parseDotNotation(expression);
    if (note) {
      const gate = (note.left / note.right) * lookup('.', env);
      const a = lookup('attack', env);
      const d = lookup('decay', env);
      const s = lookup('sustain', env);
      const r = lookup('release', env);
      return interpret(["envelope", String(a), String(d), String(s), String(r), String(gate), ["tone", note.name]], env);
    }

    return lookup(expression, env);
  } else {
    const [operator, ...operands] = expression;

    if (operator === "let") {
      const [bindings, body] = operands;

      const newEnv = [...env];

      for (let i = 0; i < bindings.length; i += 2) {
        const name = bindings[i];
        const value = interpret(bindings[i + 1], newEnv);
        newEnv.push([name, value]);
      }

      return interpret(body, newEnv);
    }

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
      case "mix":
        return mix(...evaluated);
      case "gain":
        const [signal, level] = evaluated;
        return gain(signal, level);
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }
}
