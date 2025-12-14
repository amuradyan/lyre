# Refactone
<!-- slide-id: 84aa1f38-2f78-4d79-a71f-ee60c0f981cd -->
<!-- tags: refactoring, architecture -->

This looks too long, right? Let us break it down line-by line.

```js
function* tone(frequency, duration) {
  const samplingRate = 44100;
  const totalSamples = duration * samplingRate;
  const attackTime = 0.01;
  const decayTime = 0.4;
  const sustainLevel = 0.8;
  const releaseTime = 0.6;
  const attackSamples = attackTime * samplingRate;
  const releaseSamples = releaseTime * samplingRate;
  const decaySamples = decayTime * samplingRate;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    let sample = computeSample(1, frequency, time);

    let amplitude = sustainLevel;
    if (n < attackSamples) {
      amplitude = (n + 1) / attackSamples;
    } else if (n < attackSamples + decaySamples) {
      const decayProgress = (n - attackSamples) / decaySamples;
      amplitude = 1 - (1 - sustainLevel) * decayProgress;
    } else if (n >= totalSamples - releaseSamples) {
      const releaseProgress = (totalSamples - n - 1) / releaseSamples;
      amplitude = sustainLevel * releaseProgress;
    }

    yield sample * amplitude;
  }
}
```

It has a long neck of values /lines 2-10/ and a round belly of actions /lines 12-28/. Let's start with the actions.

##### Back: [Not yet a lyre](21%20Not%20yet%20a%20lyre.md)

##### Next: [And action!](23%20And%20action!.md)
