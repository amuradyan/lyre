<!-- cspell:words Lyre variadic desugar desugared ADSR tupled lowpass highpass sawtooth freqGen rawFn filt -->

# On the language

This document explains the Lyre language - its syntax, evaluation model and syntactic sugar.

## A minimal Lisp

Lyre is a Lisp-1. One namespace, one evaluation rule, one special form. Everything else is a function looked up in the prelude: `(operator arg1 arg2 ...)`.

Parentheses group. The first position names the operation. The rest are arguments. Nested expressions are evaluated before the outer one. Numbers are numbers. Names resolve to values - a frequency, a function, a default parameter.

That's the whole syntax. Comments start with `;` and run to end of line.

## The path of a note

A single expression - `.C4` - travels through every stage of the language on its way to the speakers. Each stage below picks up one transition from this spine.

```flow
language-spine
```

The arrows are the transforms; the code under each box is what the expression looks like at that stage. `.C4` starts as typed text, becomes nested arrays of strings, gets sugar-expanded into `(play 1 C4)`, resolves `C4` to 261.63 Hz in the prelude, runs as a generator yielding `[sample, n, totalSamples]` tuples, and ends in the audio worklet.

Every section below zooms into one of these stages.

## Syntax as tree

The tokenizer is a single-pass character scanner. It walks the source one character at a time, opening arrays on `(`, closing on `)`, splitting on whitespace or pipes, and stripping comments that start with `;`. The output is nested arrays of strings, ready for `desugar`.

```text
"(sine A4)"   →  tokenize  →  [["sine", "A4"]]
                                    ↓
                              desugar  →  [["sine", "A4"]]   /no sugar here/

".C4 .E4"     →  tokenize  →  [".C4", ".E4"]
                                    ↓
                              desugar  →  [["play", "1", "C4"], ["play", "1", "E4"]]
```

Top-level expressions come back as an array so the runner can play them in sequence. Every leaf is a string - numbers, names, operators all arrive in string form. The evaluator is what turns them into values.

## Syntactic sugar

A handful of shorthand forms get expanded before evaluation to make music code read naturally.

### Composition

`-(...)` and `=(...)` wrap their operands in `sequence` and `mix`:

```text
source          desugared               meaning
--------        ------------------      -----------------------------
-(a b c)        (sequence a b c)        play a, then b, then c
=(a b c)        (mix a b c)             sum normalized by voice count
```

They only trigger before a parenthesized group. Inside an expression like `(- a b)`, they remain arithmetic operators - only arguments get sugar-expanded.

### Dot notation

`.C4`, `:G4`, `.:A4:` and friends are shorthand for `(play N note)`. The notation is loosely borrowed from sheet music - where a dot after a note extends it by half, and a second dot halves that half - but repurposed here for arbitrary fractions.

A bare name on its own is left alone: `A3` resolves to its prelude frequency of 220 Hz and plays no tone until at least one dot or colon is attached.

Dots and colons count on both sides of the note name. Each `.` is worth one, each `:` is worth two, and they are interchangeable: `:` is the same as `..`, and `:.:` the same as `.....`. The tick count is the left-side sum over the right-side sum, with either side defaulting to one when empty. Left dots multiply, right dots divide, and mixing the two gives fractions:

```text
token          ticks        note
--------       --------     -----------------------------------
.A3            1/1 = 1      one tick
:A3            2/1 = 2      two ticks       /same as ..A3/
.:A3           3/1 = 3      three ticks     /same as :.A3 or ...A3/
:.:A3          5/1 = 5      five ticks
A3:            1/2 = 0.5    half tick
A3::           1/4 = 0.25   quarter
.:A3::         3/4 = 0.75   three quarters
```

This is the only route to fractional ticks short of writing `(play 0.75 A3)` by hand.

### Bar separator

`|` is whitespace. It does nothing but helps visually:

```lisp
-(.C4 .C4 .G4 .G4 | .A4 .A4 :G4
  .F4 .F4 .E4 .E4 | .D4 .D4 :C4)
```

### Rests

`(play N 0)` or `.0` produces silence. Frequency 0 means the oscillator generates nothing, and the envelope runs for the specified ticks- useful for rhythmic gaps. A tip to make it read like sheet music is to bind `𝄽` to `0` and use that for rests.

```lisp
(play 0.5 0)       ; half-tick rest
-(.C4 .0 .E4 .0)   ; notes with rests between

(let (𝄽 0)         ; same via a sheet-music rest
  .C4 .𝄽 .E4 .𝄽 )
```

## Evaluation

Every Lyre expression takes one of these shapes:

```flow
language-grammar
```

Shape drives the dispatch:

- A **string** is either<br>&nbsp;&nbsp;&nbsp;&nbsp;a `number` /when `parseFloat` consumes it, returned as-is/, or<br>&nbsp;&nbsp;&nbsp;&nbsp;a `name` /otherwise, looked up in the env and then the prelude/.
- An **array** is either<br>&nbsp;&nbsp;&nbsp;&nbsp;a `let-form` /when the first element is `let`; binds names sequentially and evaluates the bodies in the new scope/, or<br>&nbsp;&nbsp;&nbsp;&nbsp;a `call` /otherwise; evaluates operands, looks up the operator, runs `fn(args, env)`/.

What the evaluator walks is plain nested arrays. This Lyre expression:

```lisp
(sine (+ 440 10))
```

becomes the JavaScript array `["sine", ["+", "440", "10"]]` - the exact object the evaluator receives. Every leaf is a string until evaluation. Numbers are parsed, names are looked up, and the tree drives itself. Evaluation is eager - every operand runs in full before the operator sees it, with no macros and no short-circuiting. This is as simple as an evaluator gets.

## The prelude

The prelude is a flat list of `[name, value]` pairs. Functions are values - looked up the same way notes are. This is the Lisp-1 property: `sine` lives in the same namespace as `A4`.

```flow
language-prelude
```

Every name resolves through the same lookup. User bindings from `let` shadow prelude entries - lookup searches backwards from the most recent binding.

### Functions take arrays

> Every prelude function receives `(args, env)` - an array of evaluated arguments plus the current environment.

That single convention is what makes every function variadic by default:

```lisp
(envelope 0.01 0.1 0.7 0.2    ; ADSR params
  (gate 0.5 (sine C4))        ; one source
  (gate 0.5 (sine E4))        ; another source
  (gate 0.5 (sine G4)))       ; and another
```

`envelope` peels off four numbers and treats the rest as sources, enveloping each and sequencing the results. `lowpass` and `highpass` work the same way - one cutoff, any number of sources.

### `play` and the defaults

`play` is the convenience function. It reads the current environment for `wave`, `.` /tick duration/, `attack`, `decay`, `sustain`, `release`, assembles a `gate` + `envelope` + waveform, and returns a generator.

```lisp
(play 2 A4)
```

is equivalent to:

```lisp
(envelope 0.005 0 1 0.005
  (gate 1.01 (sine 440)))
```

The `1.01` comes from: `attack + decay + ticks * . + release` = `0.005 + 0 + 2 * 0.5 + 0.005`.

Override any default with `let`:

```lisp
(let (wave triangle . 0.25 attack 0.01 release 0.1)
  (play 2 A4))
```

Now `play` uses `triangle` instead of `sine`, quarter-second ticks, and different ADSR.

## `let` - the binder

`let` introduces a local scope and binds names inside it. Values can be anything - a frequency, a waveform, a rest symbol, a whole sub-expression - and the names become available to the body.

```text
(let
  (name1 value1
   name2 value2 ...)

  body)
```

Bindings are sequential - later bindings can reference earlier ones. The bound names shadow anything in the enclosing scope. The body is a single expression; for multiple operations, wrap them explicitly with `-(...)` /sequence/ or `=(...)` /mix/.

```lisp
(let
  (root 220
   fifth (* root 1.5))

  =(
    (envelope 0.01 1.0 0 0.5 (gate 1.51 (sine root)))
    (envelope 0.01 1.0 0 0.5 (gate 1.51 (sine fifth)))))
```

## `patch` - the closure

`patch` packages a body together with the env it was defined in. Apply it later with positional args, and the body runs in that captured env extended with the bindings. Any composition of primitives becomes a reusable unit you can name and call.

```text
(patch
  (arg1 arg2 ...)
  body)
```

Bind the closure with `let` to give it a name, then call it like any prelude operation. The body sees the args plus whatever was in scope at definition.

```lisp
(let (bandpass (patch (top bottom source)
                 (lowpass top (highpass bottom source))))

  (bandpass 1500 300 (sawtooth A4)))
```

`bandpass` is now a closure that takes a top, bottom, and source. Applying it builds a fresh `lowpass`-of-`highpass` chain over the source - the body produces a new filter graph each call.

A patch whose body returns a value behaves like a function:

```lisp
(let (add (patch (x y) (+ x y)))
  (add 2 3))
```

A patch whose body returns a generator behaves like a generator factory - applying it yields a new generator. Either way, patches compose with each other and with prelude primitives uniformly.
