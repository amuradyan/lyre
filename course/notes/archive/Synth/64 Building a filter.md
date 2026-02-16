# Building a filter
<!-- slide-id: 4ab4b469-f230-4ce2-bfec-eb7d87b00084 -->
<!-- tags: exercise, filters, low-pass -->

Now let's build a low-pass filter. It wraps a source generator, maintains a single state variable, and applies the recursive formula to each sample.

The filter is a generator function that takes a source and a cutoff frequency. It calculates alpha from the cutoff, initializes the state variable y to 0, then loops over the source samples - updating y with the formula and yielding the filtered result.

<!-- playable -->
```js:Synth
const samplingRate = 44100;

function* oscillate(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / samplingRate;

  while (true) {
    yield Math.sin(phase);
    phase = phase + phaseIncrement;
  }
}

function adjustAmplitude(n, totalSamples, adsr) {
  const [attackTime, decayTime, sustainLevel, releaseTime] = adsr;
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
    return sustainLevel;
  }
}

function* tone(frequency) {
  const osc = oscillate(frequency);

  while (true) {
    const sample = osc.next().value;
    yield sample;
  }
}

function* envelope(source, attackTime, decayTime, sustainLevel, releaseTime, gateTime = 0) {
  const totalTime = attackTime + decayTime + gateTime + releaseTime;
  const totalSamples = totalTime * samplingRate;
  const adsr = [attackTime, decayTime, sustainLevel, releaseTime];

  let n = 0;
  for (const sample of source) {
    if (n >= totalSamples) {
      return;
    }
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
    n = n + 1;
  }
}

function* sawtooth(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / samplingRate;

  while (true) {
    const value = -1 + 2 * (phase / (2 * Math.PI));

    yield value;
    phase = phase + phaseIncrement;

    if (phase >= 2 * Math.PI) {
      phase = phase - 2 * Math.PI;
    }
  }
}

function* filter(source, cutoff) {
  const alpha = cutoff / samplingRate;
  let y = 0;

  for (const x of source) {
    y = y + alpha * (x - y);
    yield y;
  }
}
```

```js:TestFilter
const {sawtooth, filter, envelope} = Synth;

const play = function() {
  return envelope(
    filter(sawtooth(261.63), 2000),
    0.01, 1.0, 0, 0.5,
    0
  );
};

(function* () {
  yield* play();
})();
```

Try different cutoff values - 8000 sounds bright, 2000 is mellow, 500 is very dull. The filter is removing high-frequency harmonics, changing the timbre without changing the pitch.

##### Back: [Low-pass filters](63%20Low-pass%20filters.md)

##### Next: [Filter envelopes](65%20Filter%20envelopes.md)
