# Wrapping it up
<!-- slide-id: 73079e72-2542-40f4-ab71-b2bc130c027d -->

Every note in our melody needs the same envelope. Can we apply it once to the whole sequence instead of wrapping each note individually?

<!-- playable -->
```js:oscillator
function* oscillate(frequency) {
  const samplingRate = 44100;
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / samplingRate;

  while (true) {
    yield Math.sin(phase);
    phase = phase + phaseIncrement;
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
const {oscillate} = oscillator;

function* tone(frequency, duration) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;
  const osc = oscillate(frequency);

  for (let n = 0; n < totalSamples; n = n + 1) {
    const sample = osc.next().value;
    yield [sample, n, totalSamples];
  }
}

function* sequence(tones) {
  // yield the values of each tone generator in tones
  for (const ??? of ???) {
    ??? toneGen;
  }
}

function* envelope(source, adsr) {
  for (const [sample, n, totalSamples] of source) {
    const amplitude = computeAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
  }
}
```

```js:DoReMi
const {tone, sequence, envelope} = synth;

const plucked = [0.01, 0.4, 0.8, 0.6];

const melody = sequence(???);

envelope(???, ???); // pluck the melody
```

The `sequence` function is beautifully simple - it just yields from each tone in order. It doesn't compute totals, doesn't buffer, doesn't modify the metadata - just a passthrough that chains generators.

When envelope receives the sequence, it sees a stream of `[sample, n, totalSamples]` tuples. Each tone maintains its own timing metadata, so envelope shapes each note independently - attack\decay\sustain\release happen per-note, not globally across the whole sequence.

## Back

[Envelope as transform](28%20Envelope%20as%20transform.md)
