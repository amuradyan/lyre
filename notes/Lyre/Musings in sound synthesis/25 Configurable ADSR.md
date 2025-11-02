# Configurable ADSR
<!-- slide-id: 6fe97db1-831d-4799-bcb8-7fe71335201f -->

<!-- playable -->
```js:adsr
function computeAmplitude(n, totalSamples, ???) { // adsr should be the last argument
  const [attackTime, ???, ???, releaseTime] = adsr;
  const samplingRate = 44100;
  const attackSamples = attackTime * samplingRate;
  const releaseSamples = releaseTime * samplingRate;
  const decaySamples = decayTime * ???;

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

```js:synth
const {computeSample} = oscillator;
const {computeAmplitude} = adsr;

function* tone(frequency, duration, ???) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    const sample = computeSample(frequency, time);
    const amplitude = computeAmplitude(n, totalSamples, ???);

    yield sample * amplitude;
  }
}

function* sequence(notes) {
  for (let n = 0; n < notes.length ; n = n + 1) {
    yield* tone(notes[n][0], notes[n][1], notes[n][2])
  }
}
```

```js:oscillator
function computeSample(frequency, time) {
  return 2 * ((frequency * time) % 1) - 1;
}
```

```js:DoReMi
const {sequence} = synth;

const DoReMi = [
  [261.63, 1, [0.01, 0.4, 0.8, 0.6]],
  [293.66, 1, [0.01, 0.4, 0.8, 0.6]],
  [329.63, 1, [0.01, 0.4, 0.8, 0.6]]
];
sequence(DoReMi);
```

The ADSR parameters are now configurable - `tone` accepts attack, decay, sustain, and release times as individual parameters. This means we can create notes with different envelope shapes.

But look at what happened to the `DoReMi`: the _adsr_ is repeated in each tone. It might go to `sequence` below, but `sequence` right now does not accept adsr as a parameter. And even if it did, the tone would still expect _adsr_, or we had to change the note encoding altogether. Thinking a bit further, the _adsr_ must be passed to all the future tone composition functions as well. This might not be the best way to go.

Maybe we can find another abstraction? Let's think of what we'd like to have.

## Back

[New look](24%20New%20look.md)

## Next

[Still not there](26%20Still%20not%20there.md)
