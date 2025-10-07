# How do I describe a sound to a machine?
<!-- slide-id: 0486ef29-7d7e-4ff1-861f-dbe252e8046b -->

Sound is a wave - vibrations traveling through air.

We can represent a simple tone as a _sine wave_ with a specific _frequency_ /how many vibrations per second/ measured in Hertz.

----

Computers can't work with continuous waves. Instead, they take _samples_ - snapshots of the wave at regular intervals.

The formula for generating each sample is:

> sample[n] = A ⋅ sin(2π ⋅ f ⋅ (n / R))

Where:

- **A** - Amplitude /how loud/
- **f** - Frequency /pitch in Hz/
- **R** - Sample rate /typically 44100 samples per second/
- **n** - Sample number

----

That means the function that does it should look something like this:

```js
function tone(frequency, duration) {
  // calculate the samples

  return samples;
}
```

How do I calculate the samples, though?

## Back

- [Exercises on functions](notes/Lyre/2%20Exercises%20on%20functions.md)

## Next

- [Sampling a wave](4%20Sampling%20a%20wave.md)
