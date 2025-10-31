# Envelope as transform
<!-- slide-id: bb431905-8335-4f59-af36-235c0c29d59d -->

The `tone` function is doing two distinct jobs: generating waveform (oscillator + duration) and applying ADSR amplitude shaping. What if we separated these concerns?

The challenge: ADSR needs to know where we are in the sound (`n`) and the total length (`totalSamples`) to compute when to start the release phase. We can't buffer all samples (browser hangs), so we'll have each sample carry its own timing context. Instead of yielding just numbers, generators will yield `[sample, n, totalSamples]` tuples.

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

function* envelope(source, adsr) {
  for (const [sample, n, totalSamples] of source) {
    const amplitude = computeAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
  }
}
```

```js:DoReMi
const {tone, envelope} = synth;

const plucked = [0.01, 0.4, 0.8, 0.6];

function* playMelody() {
  yield* envelope(tone(261.63, 1), plucked);
  yield* envelope(tone(293.66, 1), plucked);
  yield* envelope(tone(329.63, 1), plucked);
}

playMelody();
```

Now `tone` is pure audio generation - oscillator scoped by duration, yielding tuples with timing metadata. The `envelope` function is a transform - it reads `[sample, n, totalSamples]` from any source and applies amplitude shaping using that timing information.

Notice how envelope doesn't know or care that the source is a tone. It just reads metadata tuples and shapes them. This separation means we could apply envelopes to other things later (sequences, parallel sounds, etc.).

But we still have repetition: `envelope(tone(...), plucked)` appears three times. Next we'll see how to compose these more elegantly.

## Back

[Phase shift](26%20Phase%20shift.md)

## Next

[Wrapping it up](28%20Wrapping%20it%20up.md)
