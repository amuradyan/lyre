# And action!
<!-- slide-id: 67d83ba8-647e-4d6c-b6d1-b22118d39feb -->

```js
function* tone(frequency, duration) {
  ...

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    let sample = computeSample(1, frequency, time);

    let amplitude = sustainLevel;
    if (n < attackSamples) {
      amplitude = (n + 1) / attackSamples;
    } else if (n < attackSamples + decaySamples) {
      const decayProgress = (n - attackSamples) / decaySamples;
      amplitude = 1 - (1 - sustainLevel) * decayProgress;
    } else if (n >= totalSamples - releaseSamples) {
      const releaseProgress = (totalSamples - n - 1) / releaseSamples;
      amplitude = sustainLevel * releaseProgress;
    }

    yield sample * amplitude;
  }
}
```

Lines 5 and 6 produce the sample. Note that we pass an amplitude of 1. This bit is useless, since we compute the amplitude later with a proper ADSR. We should remove that.

Lines 8 to 17 deal with the amplitude, adjusting it through time. This again can live in its own function. Note, how a bunch of constant definitions will also move into that function, after we extract the piece.

## Back

[Refactone](22%20Refactone.md)

## Next

[New look](24%20New%20look.md)
