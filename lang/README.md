# @lyre/core

Lyre makes sound with code. An oscillator is a generator that yields samples forever. An envelope is a generator that shapes those samples. A filter is a generator that smooths them. String these together and you have a synthesizer - built from simple, composable pieces that each do one thing well.

At its core, sound is represented as infinite streams of samples - generator functions that yield numbers between -1 and 1 at 44,100 times per second. Because everything follows this pattern, pieces compose naturally into complex sounds.

## Making sound

A plucked note takes three pieces: an oscillator that generates a wave, an envelope that shapes its amplitude over time, and ADSR parameters that define the shape.

```js
import { tone, envelope } from '@lyre/core/synth';

const pluck = envelope(
  tone(261.63),        // Middle C
  0.01,                // 10ms attack
  1.0,                 // 1 second decay
  0,                   // no sustain
  0.5                  // 500ms release
);

// pluck is a generator - iterate to get samples
for (const sample of pluck) {
  // each sample is a number between -1 and 1
  // send to audio output
}
```

The tone generates an infinite sine wave at middle C. The envelope wraps it, yielding modified samples that start quiet, rise quickly, decay over a second, and fade out. When the envelope completes, the generator stops.

## Generators as audio streams

Everything in Lyre is a generator. The simplest is oscillate, which yields a sine wave forever:

```js
import { oscillate } from '@lyre/core/synth';

const wave = oscillate(440);  // A4
// yields: 0, 0.062, 0.123, 0.182, ...
```

The tone function wraps an oscillator in a convenient generator:

```js
import { tone } from '@lyre/core/synth';

const a4 = tone(440);
// yields samples forever
```

An envelope takes a source generator and yields modified samples:

```js
const shaped = envelope(a4, 0.01, 0.1, 0.7, 0.2);
// yields samples multiplied by the envelope curve
// stops when the envelope completes
```

Because everything follows the same pattern - generators yielding samples - they compose naturally. Each generator takes sources and produces a new stream of samples.

## Composing sound

Sequence plays generators one after another:

```js
import { sequence } from '@lyre/core/synth';

const melody = sequence(
  envelope(tone(261.63), 0.01, 0.1, 0.7, 0.2),  // C
  envelope(tone(293.66), 0.01, 0.1, 0.7, 0.2),  // D
  envelope(tone(329.63), 0.01, 0.1, 0.7, 0.2)   // E
);
// yields all samples from C, then D, then E
```

Harmony mixes generators in parallel by summing their samples:

```js
import { harmony } from '@lyre/core/synth';

const chord = harmony(
  envelope(tone(261.63), 0.01, 1.0, 0, 0.5),  // C
  envelope(tone(329.63), 0.01, 1.0, 0, 0.5),  // E
  envelope(tone(392.00), 0.01, 1.0, 0, 0.5)   // G
);
// yields the sum of all three notes at each sample
```

Filters shape the frequency content by smoothing the signal:

```js
import { sawtooth, filter } from '@lyre/core/synth';

const mellow = filter(
  sawtooth(220),  // sawtooth wave (rich in harmonics)
  1000            // cutoff frequency in Hz
);
// yields smoothed samples, removing high frequencies
```

## The Lyre language

Writing nested generator calls gets verbose. The Lyre language provides cleaner syntax for the same operations:

```js
import { tokenize, interpret } from '@lyre/core';

const code = `
  (envelope
    (tone 440)
    0.05 0.05 0.9 0.1 2000)`;

const tokens = tokenize(code);
const generator = interpret(tokens);

// generator yields the same samples as the JavaScript version
```

Lyre is a minimal Lisp. Parentheses group expressions, the first element names the operation, the rest are arguments. The interpreter evaluates nested expressions and returns generators.

Note that in Lyre syntax, the gate time parameter for envelope uses milliseconds, while the JavaScript API uses seconds. The interpreter handles the conversion.

## Command line

The `lyre` command reads a `.lyre` file and outputs audio.

**Play directly:**

```bash
lyre sample.lyre --play
```

**Stream raw PCM to stdout:**

```bash
lyre sample.lyre | ffplay -f f32le -ar 48000 -autoexit -
```

The `-f f32le` flag tells ffplay to expect 32-bit little-endian floats, `-ar 48000` sets the sample rate, and `-autoexit` quits when the audio finishes.

For programmatic use, the `stream(filePath)` function reads a file and yields samples:

```js
import { stream } from '@lyre/core';

const generator = stream('melody.lyre');
for (const sample of generator) {
  // process sample
}
```

## Reference

**Generating waves.** The foundation is `oscillate(frequency)`, which yields an infinite sine wave at the given frequency. `tone(frequency)` wraps this in a convenient generator that you can pass to other functions. `sawtooth(frequency)` generates a richer waveform - a rising ramp from -1 to 1 - that contains more harmonics than a sine wave.

**Shaping sound.** `envelope(source, attack, decay, sustain, release, gateTime)` applies an ADSR envelope to a source generator. All times are in seconds. The attack ramps up from silence, decay falls to the sustain level, the sustain holds for the gate time (defaults to 0), then release fades to silence. `gain(source, level)` multiplies all samples by the given level (0 to 1) to control volume. `filter(source, cutoff)` applies a simple low-pass filter that smooths the signal, removing frequencies above the cutoff. `filterEnvelope(source, startCutoff, endCutoff, decayTime)` applies a low-pass filter with a cutoff that sweeps from start to end over the decay time - useful for evolving timbres.

**Composition.** `sequence(...generators)` plays each generator in turn, yielding all samples from the first, then all from the second, and so on. `harmony(...generators)` mixes generators in parallel by summing their samples at each step. When any generator finishes, it contributes 0 to the sum. When all finish, harmony stops. `repeat(times, generatorFunc)` repeats a generator function N times. Pass a function that returns a new generator each time it's called.

**Language.** `tokenize(input)` parses Lyre code into nested arrays of strings - the first element is the operator, the rest are operands. `interpret(expression)` evaluates a tokenized expression recursively and returns a generator. Numbers in the token array are parsed as floats. Nested arrays are interpreted as operations.

The sampling rate is 48,000 Hz, exported as `samplingRate` from the synth module.

## License

MIT
