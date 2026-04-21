<!-- cspell:words tupled lowpass highpass modgen dagre rolloff buzzy ADSR totalSamples freqGen rawFn atPhase -->

# On the engine

This document explains the architecture of the Lyre synth engine - what the primitives are, how they connect, and how signals flow through the system.

## Two worlds

The engine is split into two layers separated by a single bridge function. Everything in Lyre lives in one of these:

- **Raw world** - generators that yield plain numbers, one per sample
- **Tupled world** - generators that yield `[sample, n, totalSamples]` tuples

The raw world is small - just five oscillators. The tupled world is everything else: shapers, filters, combinators, arithmetic. The bridge between them is `wrap`.

```flow
engine-main
```

The `raw -> wrap` edge is the only one carrying raw numbers; everything after `wrap` is tupled. `wrap` feeds the bus once; from then on, every primitive is a tap on the same line.

Any tap's output can flow into any other tap's input - that's what "any-to-any" means and why all the primitives share one rail. The bus drains into `output`; nothing else consumes. Two worlds, one bridge, one sink.

## The raw world

Five oscillators live under the `raw` namespace. They take a number and yield numbers forever:

- `raw.sine` - smooth sine wave
- `raw.sawtooth` - rising ramp, all harmonics, bright and buzzy
- `raw.square` - hollow, only odd harmonics, clarinet-like
- `raw.triangle` - softer, odd harmonics with sharper rolloff than square
- `raw.flat` - constant value forever /not really an oscillator, but lives in raw for uniformity/

Raw oscillators carry no visible state - you give them a frequency, they yield numbers. The Lyre prelude never exposes them directly. They always go through `wrap` first.

## The bridge - wrap

`wrap` lifts a raw oscillator into the tupled world. Its behavior depends on what you pass as the second argument:

```flow
bridge-wrap
```

When the parameter is a number, `wrap` calls the raw oscillator and lifts each yielded sample into a tuple. When the parameter is a generator, `wrap` delegates to `modulate`, which reads a fresh frequency from the generator each sample and recomputes phase increment.

`modulate` is the generator-path half of the bridge. In composition diagrams, the pair appears as `wrap`. `modulate` surfaces in the reference - it's callable in its own right.

This is what makes vibrato possible. `(sine (+ 440 (* 10 (sine 5))))` evaluates the inner expression to a generator yielding values around 440. `wrap` sees a generator, dispatches to `modulate`, and produces a 440 Hz sine that wobbles ±10 Hz at 5 Hz.

## The tupled world

Once a signal is tupled, it can flow through any combination of these functions and back into any of them. The key categories:

### Time-boxer

Only one primitive turns infinite signals into finite ones:

- `gate(duration, source)` - yields samples for `duration` seconds, then stops

That's the only way to set a duration. Everything else is duration-agnostic - you set the duration once with `gate`, and the rest of the pipeline just shapes whatever's inside.

If you feed `wrap` a finite modulator, the oscillator inherits that finiteness - but this is signal flow, not a second time-boxer. `gate` remains the only primitive that introduces a duration.

### Shapers

Take a tupled source and yield a transformed tupled signal of the same length:

- `envelope(A, D, S, R, source)` - applies an ADSR amplitude curve. Reads the duration from the source's `totalSamples`. For infinite sources, the release never fires - sustain holds forever.
- `gain(source, level)` - multiplies every sample by `level`
- `lowpass(source, cutoff)` - first-order low-pass filter. Cutoff can be a number or a tupled generator for filter sweeps and wobbles.
- `highpass(source, cutoff)` - first-order high-pass filter. Same cutoff rules.
- `+ - * /` - sample-by-sample arithmetic. Operates as a **shaper** when one operand is a scalar /tremolo depth, DC offset/ and as a **combiner** when both are signals /ring modulation, signal sums/. Each operand can be a number or a tupled generator.

### Combinators

Variadic - fold multiple sources into one:

- `sequence(sources...)` - plays each source one after another
- `harmony(sources...)` - sums samples in parallel without normalization
- `mix(sources...)` - sums and divides by voice count to prevent clipping

## Composing a pluck

The canonical example - a plucked string:

```flow
pluck
```

Three steps, three concerns:

1. **Generate** - `raw.sine` produces samples at 440 Hz
2. **Time-box** - `gate` decides the note lasts 1.5 seconds
3. **Shape** - `envelope` applies the ADSR curve over those 1.5 seconds

Each stage's parameters live in its box; each edge's label tells you what kind of signal arrives at the next stage. The boundary between the two worlds is the `raw -> wrap` edge - the only one carrying raw samples. Note how in Lyre, you do not have to `wrap`, the system will do it for you.

```lisp
(envelope 0.01 0.4 0 0.5
  (gate 1.5 (sine 440)))
```

```javascript
envelope(0.01, 0.4, 0, 0.5,
  gate(1.5, wrap(raw.sine, 440)))
```

Each primitive does one thing. The composition tells the story.

## Modulation

Modulation is what lifts the engine above a fixed pipeline. Anywhere a scalar is accepted, a tupled generator can substitute. Three places this surfaces:

- **`wrap.param`** - frequency modulation /vibrato, FM, pitch envelopes/
- **`lowpass.cutoff`** and **`highpass.cutoff`** - filter modulation /sweeps, wah-wah/
- **arithmetic operands** - any signal can be added to or multiplied by another /tremolo, ring mod, control signal scaling/

A typical modulation pattern uses `envelope` to shape a control signal, scales it with arithmetic, and feeds it to the modulation point:

```lisp
; Brightness sweep - cutoff goes from 3000 Hz to 500 Hz over 1 second
(lowpass
  (+ 500 (* 2500 (envelope 0 0 1 1.0 (gate 1.0 (flat 1)))))
  (gate 1.0 (sawtooth 220)))
```

The inner `envelope` receives a constant `flat 1` source, gates it for 1 second, and applies an ADSR shape. The output is a curve from 0 to 1. Multiply by 2500 to get 0 to 2500. Add 500 to get 500 to 3000. Feed that into `lowpass` as the cutoff, and the filter sweeps over time.

Read that expression as a patch:

```flow
modulation-patch
```

Two paths, two rail thicknesses. The **audio path** /thick/ carries the sawtooth from oscillator through filter to output. The **control path** /thin/ builds a CV - *control voltage*, modular-synth jargon for a signal used to modulate parameters rather than be heard. A DC source is gated to 1 second, envelope-shaped into a 0-to-1 ramp, scaled to 0-2500, offset by 500, and patched into `lowpass`'s cutoff jack.

Same primitives as the audio path - `gate`, `envelope`, arithmetic - but wired for control, not sound. That's the whole trick: the engine has no separate CV world. A tupled signal becomes modulation the moment it lands on a parameter port.

## Reference

### Raw world

- `raw.sine(freq)` - number → numbers
- `raw.sawtooth(freq)` - number → numbers
- `raw.square(freq)` - number → numbers
- `raw.triangle(freq)` - number → numbers
- `raw.flat(value)` - number → numbers

### Bridge

- `wrap(rawFn, param)` - raw fn + /number or tupled generator/ → tupled
- `modulate(atPhase, freqGen)` - phase formula + tupled generator → tupled

### Tupled world

- `gate(duration, source)` - number, tupled → tupled. The only time-boxer
- `envelope(A, D, S, R, source)` - 4 numbers, tupled → tupled. Reads totalSamples from source
- `gain(source, level)` - tupled, number → tupled
- `lowpass(source, cutoff)` - tupled + /number or tupled/ → tupled. Cutoff can be modulated
- `highpass(source, cutoff)` - tupled + /number or tupled/ → tupled. Cutoff can be modulated
- `harmony(...sources)` - variadic tupled → tupled. Sums without normalization
- `mix(...sources)` - variadic tupled → tupled. Sums normalized by voice count
- `sequence(...sources)` - variadic tupled → tupled. One after another
- `+ - * /` - 2 args, each number or tupled → number or tupled. Sample-by-sample when any operand is a generator

### Lyre prelude additions

The prelude wraps these JS functions and adds:

- **Note frequencies** - `C1` through `G6` with sharps and flats
- **Defaults** - `.` /tick duration/, `attack`, `decay`, `sustain`, `release`, `wave`
- **`sine`, `sawtooth`, `square`, `triangle`, `flat`** - convenience for `wrap(raw.X, ...)`
- **`play`** - convenience for `(envelope ... (gate (...) (wave ...)))` using prelude defaults
- **`let`** - special form for local bindings
