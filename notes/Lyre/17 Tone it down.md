# Tone it down
<!-- slide-id: 1716a5bd-881e-461a-8b2b-ae4d2ac82354 -->

<!-- playable -->
```javascript:toneModule
const {computeSample} = synth;

function* tone(frequency, duration) {
  const fadeFraction = 0.01
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;
  const fadeSamples = fadeFraction * totalSamples;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    let sample = computeSample(1, frequency, time);
    let amplitude = 1;

    if (n < fadeSamples) {
      amplitude = (n + 1) / fadeSamples;
    } else if (n >= totalSamples - fadeSamples) {
      amplitude = (totalSamples - n - 1) / fadeSamples;
    }

    yield sample * amplitude;
  }
}
```

```javascript:synth
const {tone} = toneModule;

function computeSample(amplitude, frequency, time) {
  return amplitude * Math.sin(2 * Math.PI * frequency * time);
}

function* sequence(notes) {
  for (let n = 0; n < notes.length ; n = n + 1) {
    yield* tone(notes[n][0], notes[n][1])
  }
}
```

```js:DoReMi
const {sequence} = synth;

const DoReMi = [[261.63, 1], [293.66, 1], [329.63, 1]];
sequence(DoReMi);
```

## Back

[Smoooth Operator](16%20Smoooth%20operator.md)

## Next

[Long time, no acronyms](18%20Long%20time%2C%20no%20acronyms.md)
