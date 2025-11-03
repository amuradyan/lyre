# ADSR
<!-- slide-id: bc58e1c8-50b4-4955-9d8b-8286edb281a0 -->

Each characteristic of ADSR is expressed as a decimal number. __A__, __D__, and __R__ are time durations in seconds, while __S__ is an amplitude coefficient between 0 and 1. In code though, we will represent them as index intervals. For plucked string instruments like the lyre, reasonable parameters are:

* __Attack__: 0.01 seconds (10ms) - the pluck reaches peak amplitude almost instantly
* __Decay__: 0.4 seconds (400ms) - brightness fades as energy redistributes across the string
* __Sustain__: 0.8 coefficient (80%) - the tone settles to a stable level below the initial peak
* __Release__: 0.6 seconds (600ms) - the string gradually dampens to silence

Let's update the `tone` to produce sound with such parameters.

<!-- playable -->
```js:Tone
const {computeSample} = Synth;

function* tone(frequency, duration) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;
  const attackTime = 0.01;
  const decayTime = ???
  const sustainLevel = 0.8;
  const releaseTime = ???
  const attackSamples = attackTime * samplingRate;
  const releaseSamples = ???
  const decaySamples = ???

  for (let n = 0; n < totalSamples; n = n + 1) {
    let sample = computeSample(1, frequency, n / samplingRate);
    let amplitude = ???; // By default the amplitude is at sustain level

    if (n < attackSamples) {
      amplitude = (n + 1) / attackSamples;
    } else if (n < ???) {
      const decayProgress = ??? / decaySamples;
      amplitude = ??? * ???;
    } else if (n >= totalSamples - releaseSamples) {
      const releaseProgress = ??? / releaseSamples;
      amplitude = ??? * releaseProgress;
    }

    yield sample * ???;
  }
}
```

```js:Synth
const {tone} = Tone

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
const {sequence} = Synth;

const DoReMi = [[261.63, 1], [293.66, 1], [329.63, 1]];
sequence(DoReMi);
```

## Back

[Long time, no acronyms](18%20Long%20time%2C%20no%20acronyms.md)

## Next

[Waveform shape](20%20Waveform%20shape.md)
