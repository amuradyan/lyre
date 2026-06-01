# @lyre/core

Lyre makes sound with code. An oscillator is a generator that yields samples forever. An envelope is a generator that shapes those samples. A filter is a generator that smooths them. String these together and you have a synthesizer - built from simple, composable pieces that each do one thing well.

At its core, sound is represented as infinite streams of samples - generator functions that yield numbers between -1 and 1 at 48,000 times per second. Because everything follows this pattern, pieces compose naturally into complex sounds.

## Making sound

A plucked note takes three pieces: an oscillator that generates a wave, an envelope that shapes its amplitude over time, and ADSR parameters that define the shape.

```js
import { raw, wrap, gate, envelope } from '@lyre/core/synth';

const pluck = envelope(
  0.01,                      // 10ms attack
  1.0,                       // 1 second decay
  0,                         // no sustain
  0.5,                       // 500ms release
  gate(1.51,                 // 1.51s total duration
    wrap(raw.sine, 261.63))  // Middle C
);

// pluck is a generator - iterate to get samples
for (const sample of pluck) {
  // each sample is a number between -1 and 1
  // send to audio output
}
```

The raw oscillator generates samples forever, `wrap` adds position metadata, `gate` time-boxes the signal to 1.51 seconds, and `envelope` shapes the amplitude over that duration. When the gate ends, the generator stops.

## Generators as audio streams

Everything in Lyre is a generator. Raw oscillators yield plain samples:

```js
import { raw } from '@lyre/core/synth';

const wave = raw.sine(440);  // A4
// yields: 0, 0.062, 0.123, 0.182, ...
```

`wrap` converts a raw oscillator into the tupled format the pipeline expects:

```js
import { raw, wrap } from '@lyre/core/synth';

const a4 = wrap(raw.sine, 440);
// yields: [0, 0, Infinity], [0.062, 1, Infinity], ...
```

An envelope takes a tupled source and yields shaped samples:

```js
const shaped = envelope(0.01, 0.1, 0.7, 0.2, gate(1.0, a4));
// gate sets the duration, envelope shapes amplitude over it
```

Because everything follows the same pattern - generators yielding tupled samples - they compose naturally.

## Composing sound

Sequence plays generators one after another:

```js
import { sequence } from '@lyre/core/synth';

const note = (f) => gate(0.4, wrap(raw.sine, f));

const melody = sequence(
  envelope(0.01, 0.1, 0.7, 0.2, note(261.63)),  // C
  envelope(0.01, 0.1, 0.7, 0.2, note(293.66)),  // D
  envelope(0.01, 0.1, 0.7, 0.2, note(329.63))   // E
);
// yields all samples from C, then D, then E
```

Mix plays generators in parallel, normalizing by voice count to avoid clipping:

```js
import { mix } from '@lyre/core/synth';

const note = (f) => gate(1.51, wrap(raw.sine, f));

const chord = mix(
  envelope(0.01, 1.0, 0, 0.5, note(261.63)),  // C
  envelope(0.01, 1.0, 0, 0.5, note(329.63)),  // E
  envelope(0.01, 1.0, 0, 0.5, note(392.00))   // G
);
// yields normalized sum of all three notes at each sample
```

For manual level control, `harmony` sums samples without normalization - use with `gain` to set levels explicitly.

Filters shape the frequency content by smoothing the signal:

```js
import { raw, wrap, lowpass } from '@lyre/core/synth';

const mellow = lowpass(
  wrap(raw.sawtooth, 220),  // sawtooth wave (rich in harmonics)
  1000                      // cutoff frequency in Hz
);
// yields smoothed samples, removing high frequencies
```

## The Lyre language

Writing nested generator calls gets verbose. The Lyre language provides cleaner syntax for the same operations:

```js
import { tokenize, desugar, evaluate } from '@lyre/core';

const code = `
  (envelope
    0.05 0.05 0.9 0.1 0
    (sine A4))`;

const tokens = desugar(tokenize(code));
const generator = evaluate(tokens[0]);

// generator yields the same samples as the JavaScript version
```

Lyre is a minimal Lisp. Parentheses group expressions, the first element names the operation, the rest are arguments. The evaluator resolves nested expressions and returns generators.

You can write multiple top-level expressions in a single file, and they will play in sequence:

```lisp
(envelope 0.01 0.2 0 0.1 0 (sine C4))
(envelope 0.01 0.2 0 0.1 0 (sine E4))
(envelope 0.01 0.2 0 0.1 0 (sine G4))
```

Or use syntactic sugar for cleaner composition:

```lisp
-(
  (sine C4)
  (sine E4)
  (sine G4))

=(
  (sine C4)
  (sine E4)
  (sine G4))  ; Plays as a chord
```

Use `let` for local bindings:

```lisp
(let (note A4 duration 0.5)
  (envelope 0.01 0.1 0.7 0.2 duration (sine note)))
```

Note that in Lyre syntax, envelope parameters come before the source: `(envelope attack decay sustain release gate source...)`. All time values are in seconds.

Use `patch` for reusable closures - take args, capture the surrounding env, produce a generator /audio/ or value /math/ on application:

```lisp
(let (bandpass (patch (top bottom source)
                 (lowpass top (highpass bottom source))))
  (bandpass 1500 300 (sawtooth A4)))
```

### Play

`(play ticks note)` wraps a note in an envelope with default ADSR parameters. The gate time is `ticks * .` where `.` is the tick duration (default 0.5s):

```lisp
(play 1 C4)  ; one tick of middle C
(play 2 G4)  ; two ticks of G
```

Dot notation is sugar for `play`. Each `.` prefix counts as 1 tick, each `:` as 2:

```lisp
.C4          ; (play 1 C4)
:G4          ; (play 2 G4)
.:A4         ; (play 3 A4)
```

A melody using dot notation:

```lisp
-(.C4 .C4 .G4 .G4 .A4 .A4 :G4)
```

Override defaults with `let`:

```lisp
(let (. 0.25 attack 0.01 decay 0.1 sustain 0.8 release 0.05)
  -(.C4 .E4 .G4))
```

## Command line

The `lyre` command evaluates Lyre code - either from a `.lyre` file or an inline string - and writes the resulting samples.

**Play directly:**

```bash
lyre sample.lyre --play
```

**Evaluate an inline string:**

```bash
lyre --eval '(+ 1 2)' --debug
lyre --eval '(play 1 C4)' --play
```

`--eval` reads the code from the next argument instead of from a file. The other flags compose with it freely. Pass either a file path or `--eval`, not both.

**Inspect desugared tokens:**

```bash
lyre sample.lyre --desugar
```

**Inspect the tuple stream:**

```bash
lyre sample.lyre --debug
```

Prints a tab-separated `sample\tn\ttotal` table - one row per yielded tuple. Add `--stream` to include the zero-padding that surrounds audio output.

**Stream raw PCM to stdout:**

```bash
lyre sample.lyre --stream | ffplay -f f32le -ar 48000 -autoexit -
```

`--stream` wraps the output with 4800 zero-samples on each side - 100 ms of silence that prevents clicks at the start and end of playback. `--play` implies `--stream` automatically. The `-f f32le` flag tells ffplay to expect 32-bit little-endian floats, `-ar 48000` sets the sample rate, and `-autoexit` quits when the audio finishes.

For programmatic use, `compute(code)` yields raw evaluation results and `stream(code)` adds zero-padding on each side:

```js
import { compute, stream } from '@lyre/core';

for (const sample of compute('(+ 1 2)')) { /* raw samples */ }
for (const sample of stream('(play 1 C4)')) { /* padded for playback */ }
```

## Reference

### JavaScript API

**Generating waves.** Raw oscillators live under `raw` - `raw.sine`, `raw.sawtooth`, `raw.square`, `raw.triangle` yield plain samples. `raw.dc` yields a constant value. `wrap(oscillatorFn, param)` converts any raw oscillator into the tupled `[sample, n, Infinity]` format the pipeline expects.

**Shaping sound.** `envelope(attack, decay, sustain, release, source)` applies an ADSR amplitude shape to a source generator. All times are in seconds. The total duration comes from the source's tuples - use `gate(duration, source)` to set it explicitly. For infinite sources, the release phase never fires (sustain holds forever). `gain(source, level)` multiplies all samples by the given level (0 to 1) to control volume. `lowpass(source, cutoff)` applies a low-pass filter, accepting a fixed number or generator as cutoff. `highpass(source, cutoff)` is the high-pass equivalent.

**Composition.** `sequence(...generators)` plays each generator in turn, yielding all samples from the first, then all from the second, and so on. `mix(...generators)` plays generators in parallel, dividing the sum by voice count to prevent clipping. `harmony(...generators)` also plays in parallel but sums samples without normalization - use with `gain` for manual level control. When any generator finishes, it contributes 0 to the sum. When all finish, mix/harmony stops. `repeat(times, generatorFunc)` repeats a generator function N times. Pass a function that returns a new generator each time it's called.

### Lyre Language

The Lyre language currently supports these operations:

- `(sine frequency)`, `(sawtooth frequency)`, `(square frequency)`, `(triangle frequency)` - Generate wave at given frequency. Frequency can be a number /fixed/ or a generator /vibrato, FM/
- `(envelope attack decay sustain release source1 source2 ...)` - Apply ADSR amplitude shaping. Wrap sources in `gate` to set duration
- `(gate duration source)` - Time-box a source for the given duration in seconds. Hard start, hard stop, no amplitude shaping
- `(gain source level)` - Control volume (0-1)
- `(play ticks note)` - Play note for given number of ticks with default ADSR
- `(sequence sound1 sound2 ...)` - Play sounds in sequence
- `(harmony sound1 sound2 ...)` - Play sounds simultaneously, raw sum for manual mixing with `gain`
- `(mix sound1 sound2 ...)` - Play sounds simultaneously, normalized to avoid clipping
- `(let (name1 value1 name2 value2 ...) body)` - Create local bindings, evaluate the body
- `(patch (arg1 arg2 ...) body)` - Closure literal. Captures the env at definition site, takes positional args, evaluates body when applied. Bind with `let` to name it
- `(lowpass cutoff source ...)` - Low-pass filter. Cutoff in Hz, can be a number or generator for modulation
- `(highpass cutoff source ...)` - High-pass filter. Same cutoff rules as lowpass
- `(flat value)` - Constant signal, yields the same value forever
- `(+ a b)`, `(- a b)`, `(* a b)`, `(/ a b)` - Arithmetic on numbers or sample-by-sample on generators

**Syntactic sugar:**
- `-(expr1 expr2 ...)` - Shorthand for `(sequence expr1 expr2 ...)`
- `=(expr1 expr2 ...)` - Shorthand for `(mix expr1 expr2 ...)`
- `.name` / `:name` / `name.` / `name:` - Shorthand for `(play N name)`. Each `.` = 1 tick, `:` = 2. Prefix multiplies, suffix divides
- `|` - Bar separator, treated as whitespace for visual organization

**Prelude defaults:**
- `.` = 0.5 (tick duration in seconds)
- `attack` = 0.005, `decay` = 0, `sustain` = 1, `release` = 0.005
- `wave` = `sine` (default waveform used by `play`)

**Language functions.** `tokenize(input)` parses Lyre code into an array of expressions. Each expression is a nested array where the first element is the operator and the rest are operands. For single expressions, it returns an array with one element. For multiple expressions, it returns an array of expressions. `evaluate(expression)` evaluates a single tokenized expression recursively and returns a generator. Numbers in the token array are parsed as floats. Nested arrays are interpreted as operations.

The sampling rate is 48,000 Hz.

## License

MIT
