# Sampling a wave
<!-- slide-id: f51a6fdc-fbb4-49ba-b87c-faaf2d545376 -->

`nth sample = A ⋅ sin(2π ⋅ f ⋅ (n / R))`

----

To calculate `n` of something, it's usually helpful to start with calculating _one_ of something. We can repeat that n times after.

>+ One might argue that sometimes creating one of something is harder and different than creating many, and they will be right, but a) on average that is not the case and b) we won't be thinking about optimizations for early experimental structures.

For simplicity, we shall assume the sampling rate `R` to be 8 samples per second. To encode such constants int JS, we can use `const` keyword like so `const samplingRate = 8;`. We will also assume `A` to be 1 and `f` to be 1 Hz, so the wave the wave oscillates between -1 and 1, like in the image below.

![A sine wave oscillating between -1 and 1](https://thesoftwaresimpleton.com/f12565eb6d460980214a51b713905917/animated-sinewave.gif)

Let's write the function then! For now it will expect a single argument - the _sample index_ and return the value of the wave at that index\time.

```js
function computeSample(index) {
  const samplingRate = 8;
  ???; // define the amplitude constant to be 1
  ???; // define the frequency constant to be 1 Hz

  return ??? * Math.round(Math.sin(???));
}
```
<!--[
  {"inputs": [0], "expected": 0},
  {"inputs": [2], "expected": 1},
  {"inputs": [6], "expected": -1},
  {"inputs": [10], "expected": 1},
  {"inputs": [14], "expected": -1},
  {"inputs": [18], "expected": 1}
]-->

Once all the tests are green, we are done. Now let's write a function that computes _all_ samples for a given duration in seconds.

## Back

[Sounds and computers](3%20Sounds%20and%20computers.md)

## Next

[Generating all the samples](5%20Generating%20all%20the%20samples.md)
