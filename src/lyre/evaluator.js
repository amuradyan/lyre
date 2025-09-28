import { tokenize } from './tokenizer.js';
import { noteFrequencies } from './notes.js';
import { generateNote, generateSilence } from './audio.js';
import { sequence, harmony, repeat } from './composition.js';

const atom = (name) => Symbol.for(name);

let streamingEnvironment = [
  [atom("silence"), generateSilence],
  [atom("tone"), generateNote],
  [atom("sequence"), sequence],
  [atom("harmony"), harmony],
  [atom("repeat"), repeat],

  ...noteFrequencies
];



const lookupInStreamingEnvironment = (name) => {
  const matchingDefinition = streamingEnvironment.find(([key]) => key === name);
  if (matchingDefinition) {
    return matchingDefinition[1];
  } else {
    throw new Error(`🪉 Error: Unknown name ... ${atom(name)}`);
  }
};


export const evaluateStreaming = (expression) => {
  if (typeof expression === "number") {
    return function* () { yield expression; }();
  }

  if (typeof expression === "symbol") {
    const value = lookupInStreamingEnvironment(expression);
    if (typeof value === 'function') {
      return value;
    }
    return function* () { yield value; }();
  }

  if (Array.isArray(expression)) {
    const [first, ...rest] = expression;

    if (Array.isArray(first) && first[0] === atom("define")) {
      const [_, name, value] = first;
      if (typeof value === 'number') {
        streamingEnvironment.unshift([name, value]);
      } else {
        const evaluatedValue = evaluateStreaming(value);
        streamingEnvironment.unshift([name, evaluatedValue]);
      }

      if (rest.length === 1) {
        return evaluateStreaming(rest[0]);
      } else {
        return evaluateStreaming(rest);
      }
    } else {
      const [operator, ...operands] = expression;

      const evaluatedOperator = lookupInStreamingEnvironment(operator);

      if (operator === Symbol.for('repeat')) {
        const times = operands[0];
        const generatorFunc = () => evaluateStreaming(operands[1]);
        return evaluatedOperator(times, generatorFunc);
      }

      const evaluatedOperands = operands.map(op => {
        if (typeof op === 'number') return op;
        if (typeof op === 'symbol') {
          const value = lookupInStreamingEnvironment(op);
          if (typeof value === 'function' && value.constructor.name === 'GeneratorFunction') {
            return value;
          } else if (typeof value === 'function') {
            return value();
          } else {
            return value;
          }
        }
        return evaluateStreaming(op);
      });

      return evaluatedOperator(...evaluatedOperands);
    }
  }

  throw new Error(`Cannot evaluate expression: ${JSON.stringify(expression)}`);
};

export const runStreaming = (input) => {
  const tokens = tokenize(input);

  if (tokens.length === 0) {
    throw new Error("🪈 Error: Nothing to evaluate");
  } else if (tokens.length === 1) {
    return evaluateStreaming(tokens[0]);
  } else {
    return evaluateStreaming(tokens);
  }
};
