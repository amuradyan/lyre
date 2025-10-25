# That clicking sound
<!-- slide-id: 8bb2d737-52a8-47d7-aeb2-ce206f8b091d -->

Very good! Now we can play a sequence of notes, but immediately we have a problem - the clicking sound when the notes change. This happens because when we stop one note and start the next, the waveform jumps abruptly from whatever sample it was at to zero and then back to whatever sample the next note starts at. One way to fix this is via fading by gradually increasing and decreasing the sample based on where are we in time. Let's break it down on a simpler example.

Assume we have a _generator that produces `4`_ and we _sample it for one second_ at rate of a _10 samples per second_, applying a _40% fade-in and fade-out_ we should see the following values: `[1, 2, 3, 4, 4, 4, 3, 2, 1, 0]`. Indices for the first 40% can be calculated as `0.4 * 10 = 4` samples and the last 40% indices are `10 - 4 = 6` to `9`. In this case, the fade multipliers would be `1/4`, `2/4`, `3/4`, `4/4`. Note how the last sample would is `0` - silence.

Here's a rough sketch of what the code could be:

```js
function* simpleSample(duration, samplingRate, fadeFraction, generatorOfFours) {
  const totalSamples = duration * samplingRate;
  const fadeSamples = fadeFraction * totalSamples;

  for (let n = 0; n < totalSamples; n = n + 1) {
    // Below we take the next value from the generator /4 in our case/
    let sample = generatorOfFours.next().value;
    let amplitude = 1; // By default the amplitude is at 100%

    ??? // If we are in the first 40%, adjust the amplitude for fade-in
      amplitude = ((n + 1) / fadeSamples);
    ??? // Else, if we are in the last 40%, adjust the amplitude for fade-out
      amplitude = ((totalSamples - n - 1) / fadeSamples);

    yield sample * amplitude;
  }
}
```

Note how on line 12 we _manually_ get a value from the generator. Lines 14-19 though require us to learn a new trick - logically branching our code.

Turns out that's not complicated at all. Here, let me show you...

## Back

[Do, Re, Mi...](13%20Do%2C%20Re%2C%20Mi....md)

## Next

[If this, than that](15%20If%20this%2C%20than%20that.md)
