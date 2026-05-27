import { readFileSync } from 'fs';
import { tokenize, desugar } from './tokenizer.js';
import { evaluate } from './evaluator.js';

export function* compute(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  const tokens = desugar(tokenize(code));

  const isGen = (x) => typeof x?.next === 'function';

  for (const expr of tokens) {
    const value = evaluate(expr);

    if (isGen(value)) {
      yield* value;
    } else {
      yield [value, 0, 1];
    }
  }
}

export function* stream(filePath) {
  const padding = 4800;

  for (let i = 0; i < padding; i++) {
    yield [0, 0, 0];
  }

  yield* compute(filePath);

  for (let i = 0; i < padding; i++) {
    yield [0, 0, 0];
  }
}
