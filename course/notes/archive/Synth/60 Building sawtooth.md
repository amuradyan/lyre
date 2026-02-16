# Building sawtooth
<!-- slide-id: ec1aa8f6-22fd-42bc-97f8-1a8d616dae29 -->
<!-- tags: exercise, additive, sawtooth -->

We've seen that plucked strings produce harmonics that sum to create a sawtooth-like wave. But how do we create a sawtooth wave with the tools we have?

Looking at what we have: `oscillate` generates sine waves, `tone` creates tones at specific frequencies, and `harmony` combines multiple generators. A sawtooth is just the sum of harmonics - fundamental plus 2f, 3f, 4f... each with amplitude 1/n.

We can build this! Generate 10 harmonics, scale each by 1/n, and combine them with harmony.

One important detail: `sawtooth` should be a regular function, not a generator function. Generator functions like `tone` and `harmony` yield samples directly. Builder functions like `sawtooth` create and return generators. Since `sawtooth` returns the result of `harmony(...)` rather than yielding values, it must be a regular function.

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

function* harmony(...generators) {
  let n = 0;

  while (true) {
    let sum = 0;
    let allDone = true;

    for (const gen of generators) {
      const { value, done } = gen.next();
      if (!done) {
        sum = sum + value;
        allDone = false;
      }
    }

    if (allDone) {
      return;
    }

    yield sum;
    n = n + 1;
  }
}

??? sawtooth(frequency) { // #! regular function or generator function?
  const harmonics = [];

  for (let n = 1; n <= ???; n = n + 1) { // #! generate 10 harmonics
    const scaleFactor = ??? / ???; // #! amplitude decreases with harmonic number
    const scaled = (function* () {
      for (const sample of tone(??? * ???)) { // #! each harmonic is n times the fundamental
        yield sample * ???;
      }
    })();
    harmonics.push(scaled);
  }

  return harmony(...harmonics);
}
```

```js:TestSawtooth
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

This works - we're generating a sawtooth from first principles using additive synthesis. Ten sine waves at the right frequencies and amplitudes sum to approximate a sawtooth. But we'll soon see this approach has limitations.

##### Back: [String harmonics](59%20String%20harmonics.md)

##### Next: [Direct waveforms](61%20Direct%20waveforms.md)
