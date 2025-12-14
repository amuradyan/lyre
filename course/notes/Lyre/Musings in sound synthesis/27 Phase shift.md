# Phase shift
<!-- slide-id: 19173ed6-4d22-4e57-aac6-52ca31e4e07a -->
<!-- tags: exercise, oscillator, phase -->

We know that we must have the time ticks in _adsr_, since it is fundamentally a temporal thing but we don't want to pass time to it. What if we pull the notion of the tick from the inside? Instead of calculating the waveform 'from scratch' each time with `frequency * time`, the oscillator remembered where it left off? A real oscillator keeps oscillating - it maintains phase and just keeps generating samples by increasing the phase by the phase increment.

Let's implement a stateful oscillator as a generator function. It will track its own phase and yield samples indefinitely.

<!-- playable -->
```js:Oscillator
??? oscillator(frequency) {
  const samplingRate = ???;
  let phase = 0;
  const phaseIncrement = (2 * ??? * frequency) / ???; // would be the whole over the sampling rate

  while (true) {
    ??? Math.sin(phase);
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

```js:Synth
const {computeAmplitude} = ADSR;
const {oscillator} = Oscillator

function* tone(frequency, duration, adsr) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;
  const osc = ???; // Create the oscillator

  for (let n = 0; n < totalSamples; n = n + 1) {
    const rawSample = ???; // the next value of the oscillator
    const amplitude = computeAmplitude(n, totalSamples, adsr);

    yield rawSample * amplitude;
  }
}
```

```js:DoReMi
const {tone} = Synth;

const plucked = [0.01, 0.4, 0.8, 0.6];

(function* () {
  yield* tone(261.63, 1, plucked);
  yield* tone(293.66, 1, plucked);
  yield* tone(329.63, 1, plucked);
})();
```

>+ The `while (true)` construct is a loop like `for`, but it runs forever since its condition is always true. Normally this would be a problem, but with generators it's perfect - each `yield` pauses execution, and the loop only continues when someone calls `.next()`. The oscillator yields samples on demand, infinitely.

The oscillator is now a generator function that maintains its own phase state. Instead of calculating `frequency * time` for each sample, it tracks where it left off and increments phase with each yield.

But notice `tone` is doing two distinct jobs: generating waveform (oscillator + duration) and applying ADSR amplitude shaping. We're also repeating the ADSR three times in `playMelody`. What if we could separate these concerns - have `tone` just generate audio, and apply the envelope separately?

>+ Another thing to notice is how the `DoReMi` changed. The `sequence` was replaced by a very specific generator just to make it work. We'll sort it out soon, but before we need to get our lower abstractions in order.

To do that, we'll need a way for the ADSR to know where it is in the sound (`n`) and how long it lasts (`totalSamples`) without buffering all the samples first. Next we'll see how to carry that timing information through our pipeline.

##### Back: [Still not there](26%20Still%20not%20there.md)

##### Next: [Envelope as transform](28%20Envelope%20as%20transform.md)
