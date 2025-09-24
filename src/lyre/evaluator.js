import { tokenize } from './tokenizer.js';
import { noteFrequencies } from './notes.js';
import { generateNote, generateNoteArray, generateSilence } from './audio.js';
import { sequence, parallel, repeat, sequenceArray, parallelArray, repeatArray } from './composition.js';

const atom = (name) => Symbol.for(name);

// Streaming environment (generators)
let streamingEnvironment = [
  // Core streaming functions
  [atom("silence"), generateSilence],
  [atom("tone"), generateNote],
  [atom("sequence"), sequence],
  [atom("parallel"), parallel],
  [atom("repeat"), repeat],
  
  // Note frequencies
  ...noteFrequencies
];

// Legacy environment (arrays) - for backward compatibility
let environment = [
  // Core functions
  [atom("silence"), (duration) => generateNoteArray(0, duration)],
  [atom("tone"), generateNoteArray],
  [atom("sequence"), sequenceArray],
  [atom("parallel"), parallelArray],
  [atom("repeat"), repeatArray],
  
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

const lookupInStreamingEnvironment = (name) => {
  const matchingDefinition = streamingEnvironment.find(([key]) => key === name);
  if (matchingDefinition) {
    return matchingDefinition[1];
  } else {
    throw new Error(`🪈 Error: Unknown name ... ${atom(name)}`);
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

// Streaming evaluation that returns generators
export const evaluateStreaming = (expression) => {
  if (typeof expression === "number") {
    return function*() { yield expression; }();
  }

  if (typeof expression === "symbol") {
    const value = lookupInStreamingEnvironment(expression);
    if (typeof value === 'function') {
      return value;
    }
    return function*() { yield value; }();
  }

  if (Array.isArray(expression)) {
    const [first, ...rest] = expression;

    if (Array.isArray(first) && first[0] === atom("define")) {
      const [_, name, value] = first;
      const evaluatedValue = evaluateStreaming(value);
      streamingEnvironment.unshift([name, evaluatedValue]);

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
        if (typeof op === 'symbol') return lookupInStreamingEnvironment(op);
        return evaluateStreaming(op);
      });

      return evaluatedOperator(...evaluatedOperands);
    }
  }

  throw new Error(`Cannot evaluate expression: ${JSON.stringify(expression)}`);
};

// Streaming run function that returns a generator
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

// Legacy run function (arrays) - for backward compatibility
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