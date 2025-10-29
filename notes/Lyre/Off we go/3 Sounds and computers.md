# Sounds and computers
<!-- slide-id: 0486ef29-7d7e-4ff1-861f-dbe252e8046b -->

Sound is a wave - vibrations traveling through air.

We can represent a simple tone as a _sine wave_ with a specific _frequency_ - the number of vibrations per second - measured in Hertz.

----

Not all computers can work with continuous waves and it would be fair to assume that average computer won't work, mine can't. A _common_ computer will treat the wave as a list of  _samples_ and compute the snapshots of that wave at regular intervals. This is known as _sampling_ and the method is called [Pulse-code Modulation /PCM/](https://en.wikipedia.org/wiki/Pulse-code_modulation).

The formula for generating each sample is: `nth sample = A ⋅ sin(2π ⋅ f ⋅ (n / R))`

Where `sin` is the sine function and it can be found in `Math`, along with `PI`.

- **A** is the _amplitude_ or how loud the sound is
- **f** is the _frequency_ of the pitch in `Hz`
- **R** is the _sampling rate_ /typically 44100 samples per second/
- **n** is the _sample number_, hence between `0` and `R ⋅ seconds`

Note, how `(n / R)` denotes the time here. If we replace `n` with its' formula - `R ⋅ seconds`, the `R`-s cancel out and we are left with `second` measure. On a more _practical_ side, think what happens if we set `A`, `f` and `n / R` to `1`, we'll get `sin(2π)` - i.e. a full circle of sine. As `n` grows, the fraction hits, `1`, then `2` and so counting seconds. The bigger it gets, the further we are from the beginning of the sound.

----

The function that samples the wave might look something like this:

```js
function tone(frequency, duration) {
  // calculate the samples

  return samples;
}
```

How do I calculate the samples, though?

## Back

[Exercises on functions](2%20Exercises%20on%20functions.md)

## Next

[Sampling a wave](4%20Sampling%20a%20wave.md)
