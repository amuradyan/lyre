# Twinkle, twinkle
<!-- slide-id: cceb5c55-0023-4b99-b674-780e72afc750 -->
<!-- tags: lang, music, notation -->

When we look at this code we see a sequence of tones, each shaped by an envelope. That is true and we know that since we designed it. When someone who happens to know music and frequencies of notes but did not design this looks at the code, they see a structured text, mostly numbers, sometimes words. It is somewhat repetitive, a lot of zeros, looks like it's playing a sequence of tones and a bunch of numbers that probably control the playback. This is also true, though we could tell that story in less symbols.

```lyre@4.7.0
(sequence
  (envelope (tone 261.63) 0 0.5 0 0)
  (envelope (tone 261.63) 0 0.5 0 0)
  (envelope (tone 392.00) 0 0.5 0 0)
  (envelope (tone 392.00) 0 0.5 0 0)
  (envelope (tone 440.00) 0 0.5 0 0)
  (envelope (tone 440.00) 0 0.5 0 0)
  (envelope (tone 392.00) 0 1.0 0 0)
  (envelope (tone 349.23) 0 0.5 0 0)
  (envelope (tone 349.23) 0 0.5 0 0)
  (envelope (tone 329.63) 0 0.5 0 0)
  (envelope (tone 329.63) 0 0.5 0 0)
  (envelope (tone 293.66) 0 0.5 0 0)
  (envelope (tone 293.66) 0 0.5 0 0)
  (envelope (tone 261.63) 0 1.0 0 0))
```

In the code above are the first two lines of "Twinkle, twinkle little star". Both cases are hinting at a certain issue with our language - it's supposed to represent music, but it represents machinery.

Let's exercise our imagination: we'll rewrite the "Twinkle, twinkle..." to look they way we want. Maybe if we give names to some numbers and figure out how to get rid of the rest or repetition at large and allow annotations, we can get a better result?

##### Back: [Drafts](../drafts.md)

##### Next: [Music notation](61%20Music%20notation.md)
