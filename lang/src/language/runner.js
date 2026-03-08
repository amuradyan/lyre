import { readFileSync } from 'fs';
import { tokenize } from './tokenizer.js';
import { interpret } from './evaluator.js';

export function* stream(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  const tokens = tokenize(code);

  for (const expr of tokens) {
    const generator = interpret(expr);
    for (const sample of generator) {
      yield sample;
    }
  }
}
