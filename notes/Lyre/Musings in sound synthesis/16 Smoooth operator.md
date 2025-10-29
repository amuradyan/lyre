# Smoooth operator
<!-- slide-id: 8bb2d737-52a8-47d7-aeb2-ce206f8b091d -->

We can do branching now, let's finish up the `simpleSample`.

Here's brief retell of our plan to ___a___) _sample a _generator that produces `4`_-s ___b__)_ for one second_ at a _10 samples per second_ rate ___c__)_ applying 40% fade margins.

----

```js
function* tenFoursGenerator() {
  for (let i = 0; i < 10; i = i + 1) {
    ???
  }
}

function* simpleSample(duration, samplingRate, fadeFraction, generator) {
  const totalSamples = duration * samplingRate;
  const fadeSamples = ??? * ???;

  for (let n = 0; n < totalSamples; n = n + 1) {
    let sample = ???
    let amplitude = ???

    ??? { // Are we in first 40% ?
      amplitude = ???
    }
    ??? { // Are we in last 40% ?
      amplitude = ???
    }

    yield sample * ???;
  }
}

[...simpleSample(1, 10, 0.4, ???)]; // Deconstructing the generator into a list to test it
```
<!--
{"inputs": [], "expected": [1, 2, 3, 4, 4, 4, 3, 2, 1, 0]}
-->

Done and done. Let's extend this to our `tone` now.

## Back

[If this, than that](15%20If%20this%2C%20than%20that.md)

## Next

[Tone it down](17%20Tone%20it%20down.md)
