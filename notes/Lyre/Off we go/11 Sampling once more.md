# Sampling once more
<!-- slide-id: 173c5573-0d4c-45e3-9bb9-1cdb99b7a66b -->

Our original `tone` function computed all samples and returned them as a list. Here we need to turn it into a _generator_ that does the same as before, but instead of building a list of samples, it should yield them one at a time.

```js
??? tone(frequency, duration) { // make this a generator function
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

Once that is done, we should be able to generate a tone. There's one more thing though - the sampling rate. So far we were discussing waves and sound but were seeing only numbers, specifically `0`, `1` and `-1`. This was set up to rid the concept of sampling from implementation intricacies but still be able to validate what we were building. If we change the sampling rate we'll start seeing all sorts of decimal numbers between `-1` and `1`. In any case, it's not through numbers that we perceive sound, but through our ears.

Let's hear what our generator produces!

>+ If you change the sampling rate in the implementation above you'll see numbers like `0.5877852522924731` or `-0.9510565162951535`. This is so because _a)_ `Math.PI` is not the actual `π` and _b)_ computers interpret such /_floating point_/ numbers inherently inaccurately because of how the [specification of such operations](https://en.wikipedia.org/wiki/IEEE_754) is designed.

##### Back: [One sample at a time](10%20One%20step%20at%20a%20time.md)

##### Next: [Play me something!](12%20Play%20me%20something!.md)
