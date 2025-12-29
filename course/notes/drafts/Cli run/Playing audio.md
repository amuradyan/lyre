# Playing audio
<!-- slide-id: 7f30b04e-b99b-4f24-9f8c-51938beb0800 -->
<!-- tags: ffplay, pcm, unix-pipes, design -->

To play audio stream we've generated we'll use `ffplay` - a command-line player. Since we are streaming raw PCM data, we also need to instruct the player about the format specifics. In our case it a stream of 32-bit little-endian floats at 44100 Hz.

Assuming we have a sample of the _Twinkle Twinkle Little Star_ melody in `samples/twinkle.lyre` like so:

```lisp
(sequence
  (envelope (tone 261.63) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 261.63) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 392.00) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 392.00) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 440.00) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 440.00) 0.01 0.1 0.7 0.2 0.35)
  (envelope (tone 392.00) 0.01 0.1 0.7 0.2 0.85))
```

, the full command line will look like:

```bash
./lyre samples/twinkle.lyre | ffplay -f f32le -ar 44100 -autoexit -
```

>+ `-autoexit` tells `ffplay` to quit when the audio finishes instead of waiting for more input indefinitely.

Running the command should play the beginning of "Twinkle Twinkle Little Star", and we're done!

##### Back: [Streaming samples](Streaming samples.md)

##### Next: [Drafts](../drafts.md)
