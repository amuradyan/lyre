# Playing Audio
<!-- slide-id: 7f30b04e-b99b-4f24-9f8c-51938beb0800 -->
<!-- tags: ffplay, pcm, unix-pipes, design -->

Raw bytes aren't audio - they're just numbers. To play them, we need software that knows how to interpret them: what format, what sample rate, how many channels.

`ffplay` is a command-line audio and video player that can handle raw PCM /pulse-code modulation/ data. We tell it the format with flags:

```bash
./lyre.js samples/twinkle.lyre | ffplay -f f32le -ar 44100 -autoexit -
```

The `-f f32le` flag specifies the format: 32-bit float, little-endian. This matches what we're writing with `writeFloatLE`.

The `-ar 44100` flag sets the sample rate - 44100 samples per second, the standard for CD-quality audio. Our generators produce samples at this rate.

The `-autoexit` flag tells `ffplay` to quit when the audio finishes instead of waiting for more input.

The `-` at the end means "read from stdin" - the pipe from our CLI.

This is the Unix philosophy: small tools that do one thing well, connected with pipes. Our CLI generates samples. `ffplay` plays them. Neither needs to know about the other's internals.

Why this approach instead of generating WAV files? Simplicity. WAV files need headers describing the format, chunk sizes, metadata. Piping raw samples requires no encoding, no file I/O, no dependencies. The CLI stays focused on generating samples. Format handling is `ffplay`'s job.

Create `samples/twinkle.lyre`:

```lisp
(sequence
  (envelope (tone 261.63) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 261.63) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 392.00) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 392.00) 0.01 0.1 0.7 0.2 0.35))
```

Run the full pipeline:

```bash
./lyre.js samples/twinkle.lyre | ffplay -f f32le -ar 44100 -autoexit -
```

You should hear four notes - the beginning of "Twinkle Twinkle Little Star". The Lyre code has become sound.

----

Create a complete Lyre program and play it:

1. Write a `.lyre` file with a short melody /at least 3-4 notes/
2. Use the pipeline: `./lyre.js your-file.lyre | ffplay -f f32le -ar 44100 -autoexit -`
3. Verify you can hear the melody
4. Try changing frequencies and envelope parameters - the changes should be audible

Experiment with the format flags - what happens if you use `-f s16le` instead of `-f f32le`? What if you change the sample rate to `-ar 22050`?

##### Back: [Streaming Samples]

##### Next: [Next topic]
