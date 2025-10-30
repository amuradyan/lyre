# Phase shift
<!-- slide-id: 19173ed6-4d22-4e57-aac6-52ca31e4e07a -->

What if instead of calculating the waveform from scratch each time with `frequency * time`, the oscillator remembered where it left off? A real oscillator keeps oscillating - it maintains phase and just keeps generating samples.

Let's implement a stateful oscillator as a generator function. It will track its own phase and yield samples indefinitely.

<!-- playable -->
```js:oscillator
??? oscillator(frequency) { // This needs to be a generator
  const samplingRate = 44100;
  let phase = 0;
  // The phase increment is the full phase over the sampling rate
  const phaseIncrement = ???;

  // set the looping condition to `true`, i.e. loop infinitely.
  while (???) {
    yield Math.sin(phase);
    phase = phase + ???; // Advance by phase increment
  }
}
```

```js:adsr
function computeAmplitude(n, totalSamples, adsr) {
  const [attackTime, decayTime, sustainLevel, releaseTime] = adsr;
  const samplingRate = 44100;
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

```js:synth
const {computeAmplitude} = adsr;

function* tone(frequency, duration, adsr) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;
  const osc = oscillator.oscillator(frequency);

  for (let n = 0; n < totalSamples; n = n + 1) {
    const sample = osc.next().value;
    const amplitude = computeAmplitude(n, totalSamples, adsr);

    yield sample * amplitude;
  }
}

function* sequence(notes) {
  for (let n = 0; n < notes.length ; n = n + 1) {
    yield* tone(notes[n][0], notes[n][1], notes[n][2])
  }
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

>+ The `while (true)` construct is a loop like `for`, but it runs forever since its condition is always true. Normally this would be a problem, but with generators it's perfect - each `yield` pauses execution, and the loop only continues when someone calls `.next()`. The oscillator yields samples on demand, infinitely.

The oscillator is now a generator function that maintains its own phase state. Instead of calculating `frequency * time` for each sample, it tracks where it left off and increments phase with each yield. This is the natural way to model something that continuously generates values.

The `tone` function now creates an oscillator generator and pulls samples from it with `.next().value`. Each call advances the oscillator's internal phase. The oscillator runs indefinitely - `tone` controls when to stop by only pulling `totalSamples` values.

But we still have that repetition problem in DoReMi. The ADSR array appears three times. Next we'll fix that by recognizing what these pieces really are: the oscillator and ADSR together define an instrument's voice.

## Back

[Configurable ADSR](25%20Configurable%20ADSR.md)
