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

  for (const expr of tokens) {
    const generator = evaluate(expr);
    for (const sample of generator) {
      yield sample;
    }
  }

  for (let i = 0; i < padding; i++) {
    yield [0, 0, 0];
  }
}
