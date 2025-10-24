# Do, Re, Mi...
<!-- slide-id: 582ef0f9-1e12-4357-9017-2af4ae86a84d -->

One way to play multiple notes is to write them down in a list along with their durations, then loop through that list, generating samples for each note in turn.

Ah, but we need to be careful here! Since `tone()` is a generator, it yields not a list of samples but a generator. To yield all samples from a generator inside another generator, we cannot just call it - that would return the generator object itself. Instead, we need to postfix the `yield` operator in the loop with a `*` to delegate yielding to the inner generator.

Can you fill in the missing pieces?

<!-- playable -->
```js
function computeSample(amplitude, frequency, time) {
  return amplitude * Math.sin(2 * Math.PI * frequency * time);
}

function* tone(frequency, duration) {
  const samplingRate = 44100;
  const totalSamples = ??? * ???;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = ??? / samplingRate;
    yield computeSample(1, frequency, time);
  }
}

function* sequence(notes) {
  for (let n = 0; ??? ; n = n + 1) {
    ???
  }
}

const DoReMi = [[261.63, 1], [293.66, 1], [329.63, 1]];
sequence(???);
```

## Back

[Play me something!](12%20Play%20me%20something!.md)
