# Streaming Samples
<!-- slide-id: 76620115-9c09-47bf-8c42-e6deb9afca7e -->
<!-- tags: binary-io, buffers, stdout, streaming -->

Generators produce float numbers between -1 and 1. Audio players expect bytes. We need to convert floats to binary data and write it somewhere.

The natural destination is `stdout` - standard output. Whatever we write to `stdout` can be piped to another program. If we can write raw audio bytes, we can pipe them to an audio player.

Floats are 4 bytes /32 bits/ in memory. Node.js has a `Buffer` type for working with binary data:

```js
const buffer = Buffer.allocUnsafe(4);
for (const sample of generator) {
  buffer.writeFloatLE(sample, 0);
  process.stdout.write(Buffer.from(buffer));
}
```

`Buffer.allocUnsafe(4)` creates a 4-byte buffer. The "unsafe" means it doesn't zero the memory - slightly faster, and we're overwriting it immediately anyway.

`writeFloatLE(sample, 0)` writes the float at position 0 in little-endian format. Little-endian means the least significant byte comes first - this is the standard on most processors.

`process.stdout.write()` writes binary data to stdout. Regular `console.log()` would convert the buffer to a string, which isn't what we want.

Why `Buffer.from(buffer)` instead of just `buffer`? Because `stdout.write()` is asynchronous when writing to a pipe. If we pass the same buffer repeatedly, all the queued writes end up referencing the same memory. By the time the writes execute, the buffer has been overwritten with new values. Copying with `Buffer.from()` gives each write its own snapshot.

Update `lyre.js`:

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

Now run it and redirect to a file:

```bash
./lyre.js samples/twinkle.lyre > output.raw
```

You'll get a binary file. Still not playable - but the data is there.

----

Implement the streaming loop:

1. Create a 4-byte buffer outside the loop
2. For each sample from the generator:
   - Write the sample to the buffer as a little-endian float
   - Write a copy of the buffer to `process.stdout`
3. Test by redirecting output to a file: `./lyre.js samples/test.lyre > test.raw`

The file should grow as samples are generated. Check the size - at 44100 samples per second and 4 bytes per sample, a 1-second sound should be about 176KB.

##### Back: [Running Lyre Code]

##### Next: [Playing Audio]
