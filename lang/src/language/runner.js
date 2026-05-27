import { readFileSync } from 'fs';
import { tokenize, desugar } from './tokenizer.js';
import { evaluate } from './evaluator.js';

export function* stream(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  const tokens = desugar(tokenize(code));

  const padding = 4800;

  for (let i = 0; i < padding; i++) {
    yield [0, 0, 0];
  }

  const isGen = (x) => typeof x?.next === 'function';

  for (const expr of tokens) {
    const value = evaluate(expr);

    if (isGen(value)) {
      for (const sample of value) {
        yield sample;
      }
    } else {
      yield [value, 0, 1];
    }
  }

  for (let i = 0; i < padding; i++) {
    yield [0, 0, 0];
  }
}
