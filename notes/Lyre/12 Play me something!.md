# Play me something
<!-- slide-id: e05cba93-44ea-4873-aa46-77936b835f09 -->

We've built a generator that produces audio samples one at a time. Now let's actually hear what it sounds like!

Up until now, we've been working with a sampling rate of 4 samples per second just to keep the numbers simple and validate our logic. But to hear real sound, we need a realistic sampling rate of 44,100 samples per second (44.1 kHz) - the same rate used in audio CDs.

Let's start with the simplest possible example - playing middle C (C4 at 261.63 Hz) for 2 seconds.

<!-- playable -->
```js
function* tone(frequency, duration) {
  function computeSample(amplitude, frequency, time) {
    return amplitude * Math.sin(2 * Math.PI * frequency * time);
  }

  const samplingRate = ???; // set to 44100
  const totalSamples = duration * samplingRate;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    yield computeSample(1, frequency, time);
  }
}

tone(???, ???) // C4 is approximately 261.63 Hz
```

Nice! How do we play several notes though?

## Back

[Sampling once more](11%20Sampling%20once%20more.md)
