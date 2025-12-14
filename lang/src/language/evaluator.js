import { tone } from '../synth/oscillators.js';
import { envelope } from '../synth/envelopes.js';
import { sequence, harmony } from '../synth/composition.js';

export function interpret(expression) {
  if (typeof expression === 'string') {
    return parseFloat(expression);
  } else {
    const [operator, ...operands] = expression;

    const evaluated = [];
    for (const operand of operands) {
      if (typeof operand === 'string') {
        evaluated.push(parseFloat(operand));
      } else {
        evaluated.push(interpret(operand));
      }
    }

    switch (operator) {
      case "tone":
        const [frequency] = evaluated;
        return tone(frequency);
      case "envelope":
        const [source, attackTime, decayTime, sustainLevel, releaseTime, gateTime = 0] = evaluated;
        return envelope(source, attackTime, decayTime, sustainLevel, releaseTime, gateTime / 1000);
      case "sequence":
        return sequence(...evaluated);
      case "harmony":
        return harmony(...evaluated);
    }
  }
}
