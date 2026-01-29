# Synthesis
<!-- slide-id: 865658bc-e5b9-4ea1-9c1a-b57020165802 -->
<!-- tags: synth, harmony, envelope, clipping -->

That will look something like this in Lyre:

```lyre
(harmony
  (envelope (tone 237) 0.01 0 1 1 0)
  (envelope (tone 473) 0.01 0 1 1 0)
  (envelope (tone 926) 0.01 0 1 1 0)
  (envelope (tone 1873) 0.01 0 1 1 0)
  (envelope (tone 4220) 0.01 0 1 1 0)
  (envelope (tone 9646) 0.01 0 1 1 0))
```

The envelope parameters `0.01 0 1 1 0` shape each tone to sound like a pluck. The first value gives us a *sharp attack* /0.01s/ - the sound starts instantly when the string is plucked. The second /0/ means *no decay*, so there's no gradual decrease after the initial strike. The tone then maintains *full amplitude* for *1 second* before the final 0 makes it *cut off cleanly* with no release.

Execute this and listen. It sounds much closer to a plucked lyre, but there is this harsh hiss at the start. This could have been foreseen - each tone plays at *full volume*, and `harmony` adds them all together. Six tones at full amplitude sum to a signal way louder than what speakers can reproduce, so it *clips* /distorts/ at the edges.

Luckily, the solution to this is the thing we were planning to do next anyway - the volume adjustment.

##### Back: [Frequencies](52%20Frequencies.md)

##### Next: [Levels](54%20Levels.md)
