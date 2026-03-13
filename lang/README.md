# @lyre/core

Lyre makes sound with code. An oscillator is a generator that yields samples forever. An envelope is a generator that shapes those samples. A filter is a generator that smooths them. String these together and you have a synthesizer - built from simple, composable pieces that each do one thing well.

At its core, sound is represented as infinite streams of samples - generator functions that yield numbers between -1 and 1 at 48,000 times per second. Because everything follows this pattern, pieces compose naturally into complex sounds.

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

Mix plays generators in parallel, normalizing by voice count to avoid clipping:

```js
import { mix } from '@lyre/core/synth';

const chord = mix(
  envelope(tone(261.63), 0.01, 1.0, 0, 0.5),  // C
  envelope(tone(329.63), 0.01, 1.0, 0, 0.5),  // E
  envelope(tone(392.00), 0.01, 1.0, 0, 0.5)   // G
);
// yields normalized sum of all three notes at each sample
```

For manual level control, `harmony` sums samples without normalization - use with `gain` to set levels explicitly.

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
    0.05 0.05 0.9 0.1 0
    (tone A4))`;

const tokens = tokenize(code);
const generator = interpret(tokens);

// generator yields the same samples as the JavaScript version
```

Lyre is a minimal Lisp. Parentheses group expressions, the first element names the operation, the rest are arguments. The interpreter evaluates nested expressions and returns generators.

You can write multiple top-level expressions in a single file, and they will play in sequence:

```lisp
(envelope 0.01 0.2 0 0.1 0 (tone C4))
(envelope 0.01 0.2 0 0.1 0 (tone E4))
(envelope 0.01 0.2 0 0.1 0 (tone G4))
```

Or use syntactic sugar for cleaner composition:

```lisp
-(
  (tone C4)
  (tone E4)
  (tone G4))

=(
  (tone C4)
  (tone E4)
  (tone G4))  ; Plays as a chord
```

Use `let` for local bindings:

```lisp
(let (note A4 duration 0.5)
  (envelope 0.01 0.1 0.7 0.2 duration (tone note)))
```

Note that in Lyre syntax, envelope parameters come before the source: `(envelope attack decay sustain release gate source...)`. All time values are in seconds.

### Dot notation

Wrap a note name in dots or colons to get an enveloped tone with automatic duration:

```lisp
-(.C4 .C4 .G4 .G4 .A4 .A4 :G4)
```

`.C4` expands to `(envelope attack decay sustain release . (tone C4))` where `.` is the tick duration and `attack`, `decay`, `sustain`, `release` are looked up from the environment.

Dots and colons control duration as a fraction of `.`. Each `.` counts as 1, each `:` counts as 2. Left side multiplies, right side divides:

- `.C4` = 1 tick
- `:C4` = 2 ticks
- `C4:` = half tick
- `.:C4:` = 3/2 ticks

Override defaults with `let`:

```lisp
(let (. 0.25 attack 0.01 decay 0.1 sustain 0.8 release 0.05)
  -(.C4 .E4 .G4))
```

## Command line

The `lyre` command reads a `.lyre` file and outputs audio.

**Play directly:**

```bash
lyre sample.lyre --play
```

**Inspect desugared tokens:**

```bash
lyre sample.lyre --desugar
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

### JavaScript API

**Generating waves.** The foundation is `oscillate(frequency)`, which yields an infinite sine wave at the given frequency. `tone(frequency)` wraps this in a convenient generator that you can pass to other functions. `sawtooth(frequency)` generates a richer waveform - a rising ramp from -1 to 1 - that contains more harmonics than a sine wave.

**Shaping sound.** `envelope(source, attack, decay, sustain, release, gateTime)` applies an ADSR envelope to a source generator. All times are in seconds. The attack ramps up from silence, decay falls to the sustain level, the sustain holds for the gate time (defaults to 0), then release fades to silence. `gain(source, level)` multiplies all samples by the given level (0 to 1) to control volume. `filter(source, cutoff)` applies a simple low-pass filter that smooths the signal, removing frequencies above the cutoff. `filterEnvelope(source, startCutoff, endCutoff, decayTime)` applies a low-pass filter with a cutoff that sweeps from start to end over the decay time - useful for evolving timbres.

**Composition.** `sequence(...generators)` plays each generator in turn, yielding all samples from the first, then all from the second, and so on. `mix(...generators)` plays generators in parallel, dividing the sum by voice count to prevent clipping. `harmony(...generators)` also plays in parallel but sums samples without normalization - use with `gain` for manual level control. When any generator finishes, it contributes 0 to the sum. When all finish, mix/harmony stops. `repeat(times, generatorFunc)` repeats a generator function N times. Pass a function that returns a new generator each time it's called.

### Lyre Language

The Lyre language currently supports these operations:

- `(tone frequency)` - Generate sine wave at given frequency
- `(envelope attack decay sustain release gate source1 source2 ...)` - Apply ADSR envelope
- `(gain source level)` - Control volume (0-1)
- `(sequence sound1 sound2 ...)` - Play sounds in sequence
- `(mix sound1 sound2 ...)` - Play sounds simultaneously, normalized to avoid clipping
- `(harmony sound1 sound2 ...)` - Play sounds simultaneously, raw sum for manual mixing with `gain`
- `(let (var1 val1 var2 val2 ...) body)` - Create local bindings and evaluate body

**Syntactic sugar:**
- `-(expr1 expr2 ...)` - Shorthand for `(sequence expr1 expr2 ...)`
- `=(expr1 expr2 ...)` - Shorthand for `(mix expr1 expr2 ...)`
- `.name` / `:name` / `name.` / `name:` - Enveloped tone with duration (see Dot notation)
- `|` - Bar separator, treated as whitespace for visual organization

**Prelude defaults:**
- `.` = 0.5 (tick duration in seconds)
- `attack` = 0.005, `decay` = 0, `sustain` = 1, `release` = 0.005

**Language functions.** `tokenize(input)` parses Lyre code into an array of expressions. Each expression is a nested array where the first element is the operator and the rest are operands. For single expressions, it returns an array with one element. For multiple expressions, it returns an array of expressions. `interpret(expression)` evaluates a single tokenized expression recursively and returns a generator. Numbers in the token array are parsed as floats. Nested arrays are interpreted as operations.

The sampling rate is 48,000 Hz, exported as `samplingRate` from the synth module.

## License

MIT
