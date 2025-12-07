# Wrapping it up
<!-- slide-id: 73079e72-2542-40f4-ab71-b2bc130c027d -->
<!-- tags: exercise, sequence, composition -->

Usually when you play a tune on an instrument, you mostly change the pitch and not timbre. Of course, there are multitimbral instruments and the _pipe organ_ is the primary example of that - capable of producing flutes and reeds and stings simultaneously, but that's not usually the case. For now, we can safely assume that every note in our melody will use the same envelope.

We need to implement a `sequence` that would consist of `tone`-s and pass it to the `envelope`. Can you do it?

<!-- playable -->
```js:Sequence
function* sequence(tones) { // #! This should be a generator, remember?
  for (const ??? of ???) { // #! For each tone generator in tones
    /* #! Yield all samples.
        ! Remember, that simply `yield`-ing would return the generator,
        and to reference stream, we yield the with a `*`  */
    ??? tone;
  }
}
```

```js:Synth
const samplingRate = ???; // #! The standard 44100 kHz

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
    return sustainLevel
  }
}

function* tone(frequency, duration) {
  const totalSamples = duration * samplingRate;
  const osc = oscillate(frequency);

  for (let n = 0; n < totalSamples; n = n + 1) {
    const sample = osc.next().value;
    yield [sample, n, totalSamples];
  }
}

function* envelope(source, adsr) {
  for (const [sample, n, totalSamples] of source) {
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
  }
}
```

```js:DoReMi
const {tone, envelope} = Synth;
const {sequence} = Sequence;

const plucked = [0.01, 0.4, 0.8, 0.6];

const melody = sequence(???); // #! The list of corresponding tones

(function* () {
  yield* envelope(???, ???); // #! Pluck the melody
})();
```

The `sequence` function is beautifully simple - it just yields from each tone in order. It doesn't compute totals, doesn't buffer, doesn't modify the metadata - just a passthrough that chains generators.

>+ Note also, how we moved the repeating `samplingRate` out of `tone`, `adjustAmplitude` and `oscillate` in `Synth`. This makes our code more readable, and saves us from modifying the rate in several places when we have to and, possibly, forgetting some.

When envelope receives the sequence, it sees a stream of `[sample, n, totalSamples]` tuples. Each tone maintains its own timing metadata, so envelope shapes each note independently - attack\decay\sustain\release happen per-note, not globally across the whole sequence.

This was a good run. Seems like we are standing on a pretty solid sound engineering ground. Let's do some language engineering now.

##### Back: [Envelope as transform](28%20Envelope%20as%20transform.md)

##### Next: [Reading code](../A%20bit%20of%20both/30%20Reading%20code.md)
