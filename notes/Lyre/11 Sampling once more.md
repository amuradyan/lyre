# Sampling once more
<!-- slide-id: 173c5573-0d4c-45e3-9bb9-1cdb99b7a66b -->

Remember our original `tone` function that computed all samples and returned them as a list? Here we need to turn it into a _generator_ that does the same as before, but instead of building a list of samples, it should yield them one at a time.

```js
??? tone(frequency, duration) {
  function computeSample(amplitude, frequency, time) {
    return ??? * Math.sin(2 * Math.PI * ??? * time);
  }

  const samplingRate = 4;
  const totalSamples = duration * samplingRate;

  for (let n = 0; n < totalSamples; n = n + 1) {
    const time = n / samplingRate;
    ???; // yield the computed sample instead of appending to a list
  }
}
```
<!--{ "layout": "row", "tests": [
  {"inputs": [1, 1], "expected": [0, 1, 0, -1]},
  {"inputs": [1, 2], "expected": [0, 1, 0, -1, 0, 1, 0, -1]},
  {"inputs": [1, 3], "expected": [0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1]}]}
-->

## Back

[One sample at a time](10%20One%20step%20at%20a%20time.md)
