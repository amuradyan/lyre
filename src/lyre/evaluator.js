import { tokenize } from './tokenizer.js';
import { noteFrequencies } from './notes.js';
import { generateNote } from './audio.js';
import { sequence, parallel, repeat } from './composition.js';

const atom = (name) => Symbol.for(name);

let environment = [
  // Core functions
  [atom("silence"), (duration) => generateNote(0, duration)],
  [atom("tone"), generateNote],
  [atom("sequence"), sequence],
  [atom("parallel"), parallel],
  [atom("repeat"), repeat],
  
  // Note frequencies
  ...noteFrequencies
];

const lookupInEnvironment = (name) => {
  const matchingDefinition = environment.find(([key]) => key === name);
  if (matchingDefinition) {
    return matchingDefinition[1];
  } else {
    const errorMessage = `🪈 Error: Unknown name ... ${atom(name)}`;
    console.error(errorMessage);
    return errorMessage;
  }
};

export const evaluate = (expression) => {
  if (typeof expression === "number") {
    return expression;
  }

  if (typeof expression === "symbol") {
    return lookupInEnvironment(expression);
  }

  if (Array.isArray(expression)) {
    const [first, ...rest] = expression;

    if (Array.isArray(first) && first[0] === atom("define")) {
      const [_, name, value] = first;
      const evaluatedValue = evaluate(value);
      environment.unshift([name, evaluatedValue]);

      if (rest.length === 1) {
        return evaluate(rest[0]);
      } else {
        return evaluate(rest);
      }
    } else {
      const [operator, ...operands] = expression;

      const evaluatedOperator = evaluate(operator);
      const evaluatedOperands = operands.map(evaluate);

      return evaluatedOperator(...evaluatedOperands);
    }
  }
};

export const run = (input) => {
  const tokens = tokenize(input);

  if (tokens.length === 0) {
    console.error("🪈 Error: Nothing to evaluate");
    return [];
  } else if (tokens.length === 1) {
    return evaluate(tokens[0]);
  } else {
    return evaluate(tokens);
  }
};