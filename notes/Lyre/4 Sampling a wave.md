# Sampling a wave
<!-- slide-id: f51a6fdc-fbb4-49ba-b87c-faaf2d545376 -->

`nth sample = A ⋅ sin(2π ⋅ f ⋅ (n / R))`

----

To calculate `n` of something, it's usually helpful to start with calculating _one_ of something. We can repeat that n times after.

>+ One might argue that sometimes creating one of something is harder and different than creating many, and they will be right, but __a)__ on average that is not the case and __b)__ we won't be thinking about optimizations for early experimental structures.

For simplicity, we shall assume the sampling rate `R` to be 4 samples per second. To encode such constants int JS, we can use `const` keyword like so `const samplingRate = 4;`. We will also assume `A` to be 1 and `f` to be 1 Hz, so the wave oscillates between -1 and 1, like in the image below.

![A sine wave oscillating between -1 and 1](/src/assets/sine-wave.gif)

Let's write the function then! For now it will expect a single argument - the _sample index_ and return the value of the wave at that index\time.

```js
function computeSample(index) {
  const samplingRate = 4;
  ???; // define the amplitude constant to be 1
  ???; // define the frequency constant to be 1 Hz

  return ??? * Math.sin(???);
}
```
<!--[
  {"inputs": [0], "expected": 0},
  {"inputs": [1], "expected": 1},
  {"inputs": [2], "expected": 0},
  {"inputs": [3], "expected": -1}
]-->

Once this is done, we can _calculate the indices by multiplying the sampling rate with duration_ /in seconds/, then repetitively  apply the `computeSample` to every index, thus computing all the samples for a given duration.

## Back

[Sounds and computers](3%20Sounds%20and%20computers.md)

## Next

[Repetitions](5%20Repetitions.md)
