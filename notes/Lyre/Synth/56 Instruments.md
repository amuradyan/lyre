# Instruments
<!-- slide-id: f341ff3c-1f30-409a-b307-be86a0cdebe1 -->
<!-- tags: exercise, envelope, gate -->

The `tone` function shouldn't decide how long a sound lasts - the envelope should. Real synthesizers work this way: oscillators generate infinite samples, and the envelope controls duration through a gate time /how long the key is held/. For plucks, gate time is 0 and the sound dies naturally. For sustained instruments, gate time determines how long the sustain phase lasts.

Let's refactor `tone` to generate infinite samples and `envelope` to calculate its own duration from attack, decay, gate time, and release.

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

function* tone(???) { // #! tone only needs frequency - no duration
  const osc = oscillate(frequency);

  while (???) { // #! infinite loop - envelope decides when to stop
    const sample = osc.next().value;
    yield ???; // #! yield just the sample value
  }
}

function* envelope(source, attackTime, decayTime, sustainLevel, releaseTime, gateTime = 0) {
  const totalTime = ??? + ??? + ??? + ???; // #! duration = A + D + gateTime + R
  const totalSamples = totalTime * samplingRate;
  const adsr = [attackTime, decayTime, sustainLevel, releaseTime];

  let n = 0;
  for (const sample of source) {
    if (n >= ???) { // #! stop when we reach calculated duration
      return;
    }
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
    n = n + 1;
  }
}
```

```js:PluckAndWoodwind
const {tone, envelope} = Synth;

const pluck = function*() {
  yield* envelope(
    tone(261.63),
    0.01, 1.0, 0, 0.5,
    ???  // #! plucks have no gate time - dies naturally
  );
};

const woodwind = function*() {
  yield* envelope(
    tone(261.63),
    0.05, 0.05, 0.8, 0.1,
    ???  // #! gate held for 2 seconds at sustain level
  );
};

(function* () {
  yield* pluck();
  yield* woodwind();
})();
```

The key insight: `tone(frequency)` generates infinite samples, yielding just the sample value. The `envelope` calculates total duration from A + D + gateTime + R, then consumes exactly that many samples from the source before stopping. For plucks, gateTime = 0 so the sound dies during decay. For sustained instruments, gateTime > 0 so the sustain phase actually lasts.

##### Back: [Making the change](55%20Making%20the%20change.md)

##### Next: [Updating the interpreter](57%20Updating%20the%20interpreter.md)
