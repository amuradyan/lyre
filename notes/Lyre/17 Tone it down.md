# Tone it down
<!-- slide-id: 1716a5bd-881e-461a-8b2b-ae4d2ac82354 -->

Now let us upgrade the `tone` from [Do, Re, Mi...] to smooth the transitions and assume the fade margin to be 1/100-th of the second. Given our 44100 sampling rate, that would give us 441 samples.

>+ Note that if we tie the fades with the full duration, playing the same not for a longer time will cause slower amplitude adjustments.

<!-- playable -->
```js
function computeSample(amplitude, frequency, time) {
  return amplitude * Math.sin(2 * Math.PI * frequency * time);
}

function* tone(frequency, duration) {
  const fadeFraction = ???
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;
  const fadeSamples = fadeFraction * ???;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    let sample = ???;
    let amplitude = ???;

    if (n < fadeSamples) {
      amplitude = ???
    } ??? {
      amplitude = (??? - n - 1) / fadeSamples;
    }

    yield sample * amplitude;
  }
}

function* sequence(notes) {
  for (let n = 0; n < notes.length ; n = n + 1) {
    yield* tone(???, ???)
  }
}

const DoReMi = [[261.63, 1], [293.66, 1], [329.63, 1]];
sequence(DoReMi);
```

>+ Note how updating `tone` does not bother the `sequence`. That is an helpful feature, and we should try and build our code, so that changing something in one place concerns as few other places as possible.

Like a breeze, eh? This is not all though. If we look around, we'll find an existing abstraction that does this and more - the ADSR envelope.

## Back

[Smoooth Operator](16%20Smoooth%20operator.md)

## Next

[Long time, no acronyms](18%20Long%20time%2C%20no%20acronyms.md)
