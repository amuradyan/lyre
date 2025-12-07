# Envelope as transform
<!-- slide-id: bb431905-8335-4f59-af36-235c0c29d59d -->

The `tone` function is doing two distinct jobs: generating waveform /oscillator + duration/ and applying ADSR amplitude shaping. What if pull the latter out and make an envelope out of it? It will take the samples and apply the _adsr_ config. The challenge here is to get the info on _where we are in the sound_ /`n`/ and _the total length_ /`totalSamples`/ to compute when to start the release phase for example. Luckily, we have all the info we need in the `tone`, we just never shared with it. By yielding the total length and current position along with sample /`[sample, n, totalSamples]` in a tuple, we turn `tone` into a comfortable-to-use sound source.

<!-- playable -->
```js:Synth
const {computeAmplitude} = ADSR;
const {oscillator} = Oscillator;

function* tone(frequency, duration) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;
  const osc = oscillator(frequency);

  for (let n = 0; n < totalSamples; n = n + 1) {
    const sample = osc.next().value;
    yield [???, n, ???];
  }
}

function* envelope(source, adsr) {
  for (const [sample, ???, ???] of source) {
    const amplitude = computeAmplitude(???);
    yield sample * ???;
  }
}
```

```js:Oscillator
function* oscillator(frequency) {
  const samplingRate = 44100;
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / samplingRate;

  while (true) {
    yield Math.sin(phase);
    phase = phase + phaseIncrement;
  }
}
```

```js:ADSR
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

```js:DoReMi
const {tone, envelope} = Synth;

const plucked = [0.01, 0.4, 0.8, 0.6];

(function* () {
  yield* envelope(tone(261.63, 1), plucked);
  yield* envelope(tone(293.66, 1), plucked);
  yield* envelope(tone(329.63, 1), plucked);
})();
```

Now `tone` is pure audio generation - oscillator scoped by duration, yielding tuples with timing metadata. The `envelope` function is a transform - it reads `[sample, n, totalSamples]` from any source and applies amplitude shaping using that timing information. Notice how envelope doesn't know or care that the source is a tone. It just reads metadata tuples and shapes them. This separation means we could apply envelopes to other things later /sequences, harmony, etc./.

Seems we're ready to replace gnarly sequencer in `DoReMi` wit a proper `sequence`.

##### Back: [Phase shift](27%20Phase%20shift.md)

##### Next: [Wrapping it up](29%20Wrapping%20it%20up.md)
