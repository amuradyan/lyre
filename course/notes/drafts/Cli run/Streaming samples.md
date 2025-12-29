# Streaming samples
<!-- slide-id: 76620115-9c09-47bf-8c42-e6deb9afca7e -->
<!-- tags: binary-io, buffers, stdout, streaming -->

Our generators produce floats between -1 and 1. Audio players expect bytes. We need to convert floats to binary data and write them to `stdout` - standard output - so they can be piped to another program. Floats are 4 bytes /32 bits/ and apparently it's important in what order we write those bytes.

We create a 4-byte buffer once, then for each sample we write the float into it in little-endian format /least significant byte first/ and write a copy to `process.stdout`.

```js
#!/usr/bin/env node
import { stream } from '../src/language/runner.js';

const filePath = process.argv[2];
const generator = stream(filePath);

const buffer = Buffer.allocUnsafe(4);

for (const sample of generator) {
  buffer.writeFloatLE(sample, 0);
  process.stdout.write(Buffer.from(buffer));
}
```

>+ `Buffer.allocUnsafe(4)` creates a 4-byte buffer without zeroing the memory - faster since we're about to overwrite it. `writeFloatLE(sample, 0)` writes the float at position 0 in little-endian format, effectively overwriting the entire buffer with the new sample and `Buffer.from(buffer)` creates a copy. Without it, all queued writes would reference the same buffer, which gets overwritten before the writes execute. `process.stdout.write()` writes binary data to stdout.

This gets us to a place where `./bin/lyre.js sample.lyre` produces the raw PCM data and that's all we need to go from a Lyre file to sound.

##### Back: [Running Lyre code](Running Lyre code.md)

##### Next: [Playing audio](Playing audio.md)
