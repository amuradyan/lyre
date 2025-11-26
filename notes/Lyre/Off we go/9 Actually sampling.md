# Actually sampling
<!-- slide-id: 93569740-c8b4-49ae-b714-c2138ac80e09 -->

Seems we figured out all the tools we need to actually sample a wave for a given duration, so let's give it a go!

Looking back at slide [3](#sounds-and-computers), we defined tone to be a function that takes frequency and duration as arguments and returns the samples and we know how to compute each sample for a given index from slide [4](#sampling-a-wave). We'll get the samples by looping over all the sample indices and collecting the results into a list.

Again we will assume a _sampling rate_ of 4 samples and with _amplitude_ and _frequency_ set to 1 for simplicity, like so:

![A sine wave oscillating between -1 and 1](/src/assets/sine-wave.gif)

```js
function tone(frequency, duration) {
  function computeSample(amplitude, frequency, time) {
    return ??? * Math.sin(2 * Math.PI * ??? * time);
  }

  let samples = ???;
  const samplingRate = 4;
  const totalSamples = ???; // calculate total samples based on duration and sampling rate

  for (???; n < ???; n = n + 1) {
    const time = n / ???;
    samples = [???, ???];
  }

  ??? samples;
}
```
<!--{ "layout": "row", "tests": [
  {"inputs": [1, 1], "expected": [0, 1, 0, -1]},
  {"inputs": [1, 2], "expected": [0, 1, 0, -1, 0, 1, 0, -1]},
  {"inputs": [1, 3], "expected": [0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1]}]}
-->

##### Back: [Exercises on lists](8%20Exercises%20on%20lists.md)

##### Next: [One step at a time](10%20One%20step%20at%20a%20time.md)
