# Reading Lyre files
<!-- slide-id: f7803d9f-ce72-490f-aed7-8b1d3c46d3d9 -->
<!-- tags: file-io, generators, streaming, node -->

Node.js has a `fs` module /file system/ for reading and writing files. We'll use `readFileSync` to read an entire file into memory as a string. Then we can pass that string to our existing tokenizer and evaluator to get a sample generator.

Let's create `src/language/runner.js`:

```js
import { readFileSync } from 'fs';
import { tokenize } from './tokenizer.js';
import { interpret } from './evaluator.js';

export function* stream(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  const tokens = tokenize(code);
  const generator = interpret(tokens);

  for (const sample of generator) {
    yield sample;
  }
}
```

The `stream` function yields samples one at a time.

##### Back: [From browser to command line](From browser to command line.md)

##### Next: [Running Lyre code](Running Lyre code.md)
