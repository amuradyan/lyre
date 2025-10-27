# Not yet a lyre
<!-- slide-id: cf365ea7-6567-4b96-ad1e-9d7259aba4af -->

The mathematical formula for a sawtooth wave is `2 * ((frequency * time) % 1) - 1`. Let's replace our sine wave with a sawtooth and hear the difference.

<!-- playable -->
```js
function computeSample(amplitude, frequency, time) {
  return amplitude * ???;
}

function* tone(frequency, duration) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;

  const attackTime = 0.01;
  const decayTime = 0.4;
  const sustainLevel = 0.8;
  const releaseTime = 0.6;

  const attackSamples = attackTime * samplingRate;
  const releaseSamples = releaseTime * samplingRate;
  const decaySamples = decayTime * samplingRate;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    let sample = computeSample(1, frequency, time);
    let amplitude = 1;

    if (n < attackSamples) {
      amplitude = (n + 1) / attackSamples;
    } else if (n < attackSamples + decaySamples) {
      const decayProgress = (n - attackSamples) / decaySamples;
      amplitude = 1 - (1 - sustainLevel) * decayProgress;
    } else if (n >= totalSamples - releaseSamples) {
      const releaseProgress = (totalSamples - n - 1) / releaseSamples;
      amplitude = sustainLevel * releaseProgress;
    } else {
      amplitude = sustainLevel;
    }

    yield sample * amplitude;
  }
}

function* sequence(notes) {
  for (let n = 0; n < notes.length ; n = n + 1) {
    yield* tone(notes[n][0], notes[n][1])
  }
}

const DoReMi = [[261.63, 1], [293.66, 1], [329.63, 1]];
sequence(DoReMi);
```

The sawtooth waveform gives our sound that stringy, plucked quality - it's definitely closer! But it's still not quite a lyre. As we have said before - _real instruments produce complex, time-varying sounds_, while in our implementation all harmonics are following the same ADSR envelope, i.e. the 10th harmonic lives just as long as the fundamental, which doesn't match how real strings behave.

In reality, when you pluck a string, the high-frequency harmonics decay much faster than the low ones. This creates a characteristic timbral evolution: the sound starts bright and cutting, then becomes mellower and warmer as it sustains.

To capture this properly, we need to control each harmonic independently - giving the high frequencies a short, bright decay and the low frequencies a longer, sustained presence. This means generating each harmonic as its own `tone` and combining them.

But to combine multiple tones happening at the same time, we need a new language feature: `parallel`.

## Back

[Waveform shape](20%20Waveform%20shape.md)
