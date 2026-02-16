# Direct waveforms
<!-- slide-id: a224a947-9a02-4782-a278-ded1bc662036 -->
<!-- tags: exercise, waveforms, sawtooth -->

The sawtooth from slide 60 works, but it has a problem. To get smooth slopes, we need many more harmonics - 20, 50, even 100. Each harmonic means another oscillator running, another tone generator, another stream of samples to sum. This gets computationally expensive fast.

There's a better way: calculate the waveform directly using its mathematical formula. Instead of summing harmonics, we compute the exact value for each phase. For a sawtooth wave, the pattern is simple - as phase goes from 0 to 2π, the value ramps linearly from -1 to 1. The formula is:

    `value = -1 + 2 * (phase / (2 * Math.PI))`

When phase is 0, we get -1. When phase reaches 2π, we get -1 + 2 * 1 = 1. Everything in between is a straight line. No harmonics to sum, no generators to manage - just one multiplication and one addition per sample.

Notice the difference from the `sawtooth` on slide 60: that function built generators and returned the result of `harmony`. This `sawtooth` function is a generator itself - it yields samples directly, calculating each value from the current phase.

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
    const value = ???;

    yield value;
    phase = phase + phaseIncrement;

    if (phase >= 2 * Math.PI) {
      phase = phase - 2 * Math.PI;
    }
  }
}
```

```js:PlaySawtooth
const {sawtooth, envelope} = Synth;

const play = function() {
  return envelope(
    sawtooth(261.63),
    0.01, 1.0, 0, 0.5,
    0
  );
};

(function* () {
  yield* play();
})();
```

Much simpler, much faster. One phase counter, one formula, no array of generators to manage. This is how most synthesizers generate waveforms - directly from formulas, not by summing harmonics.

##### Back: [Building sawtooth](60%20Building%20sawtooth.md)

##### Next: [Evolving timbre](62%20Evolving%20timbre.md)
