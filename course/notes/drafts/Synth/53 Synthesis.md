# Synthesis
<!-- slide-id: 865658bc-e5b9-4ea1-9c1a-b57020165802 -->
<!-- tags: synth, harmony, envelope, implementation -->

That will look something like this in Lyre:

```lyre
(harmony
  (envelope (tone 233) 0.01 0 1 1 0)
  (envelope (tone 477) 0.01 0 1 1 0)
  (envelope (tone 943) 0.01 0 1 1 0)
  (envelope (tone 1864) 0.01 0 1 1 0)
  (envelope (tone 4220) 0.01 0 1 1 0)
  (envelope (tone 9654) 0.01 0 1 1 0))
```

The envelope parameters `0.01 0 1 1 0` shape each tone to sound like a pluck. The first value gives us a **sharp attack** /0.01s/ - the sound starts instantly when the string is plucked. The second /0/ means **no decay**, so there's no gradual decrease after the initial strike. The tone then maintains **full amplitude** for **1 second** before the final 0 makes it **cut off cleanly** with no release.

Execute this and listen. It sounds much closer to the a plucked lyre! Now, let's adjust the volumes of each harmonic to better match the original sound.

##### Back: [Frequencies](52%20Frequencies.md)

##### Next: [Volume](54%20Volume.md)
