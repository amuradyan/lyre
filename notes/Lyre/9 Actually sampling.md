# Actually sampling
<!-- slide-id: 93569740-c8b4-49ae-b714-c2138ac80e09 -->

![A sine wave oscillating between -1 and 1](/src/assets/sine-wave.gif)

----

```js
function tone(duration) {
  function computeSample(amplitude, frequency, t) {
    return amplitude * Math.sin(2 * Math.PI * frequency * t);
  }

  let samples = ???;
  const samplingRate = 4;
  const totalSamples = ???; // calculate total samples based on duration and sampling rate

  for (???; n < ???; n = n + 1) {
    const t = n / ???;
    samples = [???, ???];
  }

  return samples;
}
```
<!--{ "layout": "row", "tests": [
  {"inputs": [1], "expected": [0, 1, 0, -1]},
  {"inputs": [2], "expected": [0, 1, 0, -1, 0, 1, 0, -1]},
  {"inputs": [3], "expected": [0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1]}]}
-->

## Back

[Exercises on lists](8%20Exercises%20on%20lists.md)

## Next

[One sample at a time](10%20One%20step%20at%20a%20time.md)
