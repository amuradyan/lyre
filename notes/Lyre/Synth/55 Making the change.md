# Making the change
<!-- slide-id: a8ad19fb-3399-452d-813c-af0a04081cbf -->
<!-- tags: refactor, implementation -->

Let's implement this redesign. We'll start with the Synth module, then update the interpreter to match.

The `tone` change is straightforward. We remove the duration parameter - tone doesn't decide how long it lasts anymore. Without a duration, we don't need `totalSamples`, and the loop becomes infinite. We also simplify what we yield - just the sample value, no metadata tuple.

```js
function* tone(frequency, duration) {  // remove duration
  const totalSamples = duration * samplingRate;  // remove this
  const osc = oscillate(frequency);

  for (let n = 0; n < totalSamples; n = n + 1) {  // while (true)
    const sample = osc.next().value;
    yield [sample, n, totalSamples];  // yield sample
  }
}
```

The `envelope` change is more involved. We add a `gateTime` parameter with a default of 0, then calculate our own duration from the ADSR times. Since the source no longer yields metadata tuples, we maintain our own sample counter `n`. We stop consuming samples when we hit our calculated duration.

```js
// add gateTime argument with default 0
function* envelope(source, attackTime, decayTime, sustainLevel, releaseTime) {
  // calculate duration: A + D + (gateTime * S) + R
  // convert to samples: totalTime * samplingRate

  const adsr = [attackTime, decayTime, sustainLevel, releaseTime];

  // track our own counter: let n = 0
  for (const [sample, n, totalSamples] of source) {  // simplify: for (const sample of source)
    // stop at duration: if (n >= totalSamples) return
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield sample * amplitude;
    // increment our counter: n = n + 1
  }
}
```

##### Back: [Sustain and decay](54%20Sustain%20and%20decay.md)
