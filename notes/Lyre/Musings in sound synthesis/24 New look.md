# New look
<!-- slide-id: d6ad2cfa-0960-45f9-bbcb-fbf9b05764a4 -->

Below is a step in that direction.

`computeSample` under `oscillator` now generates pure waveform samples - no amplitude parameter, just frequency and time. It returns raw waveform values from -1 to 1, representing the shape of the sound without any volume control.

The ADSR amplitude logic with a bunch of values has been extracted into `computeAmplitude` under `adsr`. Given a sample index and total duration, it returns the volume multiplier at that moment. All the calculations that were cluttering `tone` now live in this dedicated function.

<!-- playable -->
```js:Oscillator
function computeSample(frequency, time) {
  return 2 * ((frequency * time) % 1) - 1;
}
```

```js:ADSR
function computeAmplitude(n, totalSamples) {
  const samplingRate = 44100;
  const attackTime = 0.01;
  const decayTime = 0.4;
  const sustainLevel = 0.8;
  const releaseTime = 0.6;
  const attackSamples = attackTime * samplingRate;
  const releaseSamples = releaseTime * samplingRate;
  const decaySamples = decayTime * samplingRate;

  if (n < attackSamples) {
    return (n + 1) / attackSamples;
  } else if (n < attackSamples + decaySamples) {
    const decayProgress = (n - attackSamples) / decaySamples;
    return 1 - (1 - sustainLevel) * decayProgress;
  } else if (n >= totalSamples - releaseSamples) {
    const releaseProgress = (totalSamples - n - 1) / releaseSamples;
    return sustainLevel * releaseProgress;
  } else {
    return sustainLevel
  }
}
```

```js:Synth
const {computeSample} = Oscillator;
const {computeAmplitude} = ADSR;

function* tone(frequency, duration) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    const sample = computeSample(frequency, time);
    const amplitude = computeAmplitude(n, totalSamples);

    yield sample * amplitude;
  }
}

function* sequence(notes) {
  for (let n = 0; n < notes.length ; n = n + 1) {
    yield* tone(notes[n][0], notes[n][1])
  }
}
```

```js:DoReMi
const {sequence} = Synth;

const DoReMi = [[261.63, 1], [293.66, 1], [329.63, 1]];
sequence(DoReMi);
```

The `tone` function in `synth` becomes cleaner - it gets the waveform shape from the oscillator, gets the amplitude from ADSR, multiplies them together. The separation is clear: oscillator handles waveform generation, ADSR handles amplitude over time, `tone` combines them.

This, however, leaves us with hardcoded adsr params. Let's extract them into arguments, but this time, pass it from the _very top_. `???`-s incoming!

## Back

[And action!](23%20And%20action!.md)

## Next

[Configurable ADSR](25%20Configurable%20ADSR.md)
