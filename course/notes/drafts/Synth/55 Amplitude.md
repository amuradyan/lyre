# Amplitude
<!-- slide-id: 1f814aa5-56e4-4605-98d9-a95d405bf4c3 -->
<!-- tags: synth, amplitude, volume, mixing -->

Our pluck sounds pretty good, but all frequencies are playing at the same volume. Look back at the spectrum analyzer - the real pluck has different amplitudes for each harmonic.

The fundamental at 233Hz peaks around -25dB, while the highest harmonic at 9397Hz sits closer to -35dB. That's a significant difference in loudness.

----

To match the real pluck, we need to control the amplitude of each tone independently. In audio terms, this is called _gain_ - multiplying the signal by a value between 0 and 1.

If we had a `gain` primitive, we could write:

```js
(harmony
  (gain (envelope (tone 233) 0.01 0 1 1 0) 1.0)    ; fundamental loudest
  (gain (envelope (tone 466) 0.01 0 1 1 0) 0.8)    ; first harmonic quieter
  (gain (envelope (tone 932) 0.01 0 1 1 0) 0.6)    ; second harmonic quieter still
  (gain (envelope (tone 1864) 0.01 0 1 1 0) 0.4)   ; third harmonic
  (gain (envelope (tone 4186) 0.01 0 1 1 0) 0.2)   ; fourth harmonic
  (gain (envelope (tone 9397) 0.01 0 1 1 0) 0.1)   ; highest harmonic quietest
)
```

Each tone gets scaled by its gain value. A gain of 1.0 means full volume, 0.5 means half volume, and so on.

----

The relationship between dB and amplitude isn't linear - it's logarithmic. A difference of -10dB means the amplitude is roughly one-third of the original. That's why -25dB and -35dB sound quite different even though the numbers seem close.

For now, we've chosen gain values by ear - making higher harmonics progressively quieter. Later, we could calculate exact gain values from the dB readings, but artistic choices often trump mathematical precision in sound design.

----

We'll need to implement the `gain` primitive in our Lyre engine to make this work. But the concept is simple: multiply each sample by the gain value.

>+ Try experimenting with different gain values. What happens if you make the high harmonics louder than the fundamental? Does it still sound like a lyre, or something else entirely?

##### Back: [Volume](54%20Volume.md)

##### Next: [Drafts](../../drafts.md)
