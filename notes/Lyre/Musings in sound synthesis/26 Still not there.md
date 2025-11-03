# Still not there
<!-- slide-id: 1b7db25c-a23e-4c28-943f-72ff02b79b67 -->

What if we could write this instead?

```js:DoReMi
const {tone, sequence, envelope} = Synth;

const plucked = [0.01, 0.4, 0.8, 0.6];

const melody = sequence([
  tone(261.63, 1),
  tone(293.66, 1),
  tone(329.63, 1)
]);

envelope(melody, plucked);
```

```js:Synth
function* oscillate(frequency) { ??? }
function* tone(frequency, duration) { ??? }
function* sequence(tones) { ??? }
function* envelope(source, adsr) { ??? }
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

Musical structure in one place, timbre in another. The `tone` function knows nothing about ADSR - just pitch and duration. The `sequence` function knows nothing about envelopes - just combining tones. And `envelope` wraps around anything - a single tone, a sequence, a parallel composition. You can see the draft on `synth` tab.

But wait - how will the envelope know when to start the release phase, if we don't pass it the time? It needs to know where we are in the sound and how long it lasts. Without buffering all samples (browser hangs!), we need another trick.

What if each sample carried its own timing? If we can make the oscillator maintain its internal clock, we can then yield the ticks along with the sample values and whatnot in tuples. Then envelope can read the metadata from the stream and apply amplitude shaping without knowing what generated it.

Let's see if that works.

## Back

[Configurable ADSR](25%20Configurable%20ADSR.md)

## Next

[Phase shift](27%20Phase%20shift.md)
