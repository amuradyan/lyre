# Building filter envelope
<!-- slide-id: 52070948-e2ca-4c11-afa4-1db27e345eba -->
<!-- tags: exercise, filters, envelopes -->

Now let's implement a filter with time-varying cutoff. The function takes a source, start cutoff, end cutoff, and decay time. It maintains filter state while updating the cutoff frequency for each sample.

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

function* filterEnvelope(source, startCutoff, endCutoff, decayTime) {
  const decaySamples = decayTime * samplingRate;
  let y = 0;
  let n = 0;

  for (const x of source) {
    const progress = Math.min(1, n / decaySamples);
    const cutoff = startCutoff + (endCutoff - startCutoff) * progress;
    const alpha = cutoff / samplingRate;

    y = y + alpha * (x - y);
    yield y;

    n = n + 1;
  }
}
```

```js:TestFilterEnvelope
const {sawtooth, filterEnvelope, envelope} = Synth;

const play = function() {
  return envelope(
    filterEnvelope(sawtooth(261.63), 8000, 500, 1.5),
    0.01, 1.0, 0, 0.5,
    0
  );
};

(function* () {
  yield* play();
})();
```

Listen to the difference - the sound starts bright and gradually becomes dull, just like a real plucked string. The filter cutoff decays from 8000 Hz to 500 Hz over 1.5 seconds while the amplitude envelope controls the overall volume.

##### Back: [Dynamic cutoff](66%20Dynamic%20cutoff.md)
