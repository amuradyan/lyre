<!-- cspell:words Lyre variadic desugar desugared ADSR tupled lowpass highpass sawtooth freqGen rawFn filt -->

# On the language

This document explains the Lyre language - its syntax, evaluation model, syntactic sugar, and what it could become.

## A minimal Lisp

Lyre is a Lisp-1. One namespace, one evaluation rule, one special form. Everything else is a function looked up in the prelude.

```
(operator arg1 arg2 ...)
```

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

Three sugar forms are expanded by `desugar` before evaluation.

```text
source          desugared               meaning
--------        ------------------      -----------------------------
-(a b c)        (sequence a b c)        play a, then b, then c
=(a b c)        (mix a b c)             sum normalized by voice count
.C4             (play 1 C4)             one tick
:G4             (play 2 G4)             two ticks
.:A4            (play 3 A4)             three ticks  /. = 1, : = 2/
C4.             (play 0.5 C4)           half tick    /suffix divides/
C4:             (play 0.25 C4)          quarter tick
```

Prefix `.` and `:` multiply the tick count; suffix versions divide. The formula is `prefixSum / suffixSum`, with each `.` worth 1 and each `:` worth 2.

The `-` and `=` only trigger as sugar when they appear before a parenthesized group. Inside an expression like `(- a b)`, they remain arithmetic operators - only arguments get sugar-expanded.

### Bar separator

`|` is whitespace. It does nothing but helps visually:

```lisp
-(.C4 .C4 .G4 .G4 | .A4 .A4 :G4
  .F4 .F4 .E4 .E4 | .D4 .D4 :C4)
```

### Rests

`(play N 0)` or `.0` produces silence. Frequency 0 means the oscillator generates nothing, and the envelope runs for the specified ticks. Useful for rhythmic gaps:

```lisp
-(play 0.5 0)       ; half-tick rest
-(.C4 .0 .E4 .0)   ; notes with rests between
```

## Evaluation

Every Lyre expression takes one of these shapes:

```flow
language-grammar
```

The evaluator is twelve lines of code. It dispatches on shape:

- **`number`** - returned unchanged. A string that `parseFloat` consumed.
- **`name`** - looked up in the current environment, falling back to the prelude. This is how `A4` resolves to `440` and `sine` to a function.
- **`let-form`** - the only special form. Binds names sequentially, then evaluates bodies in the new scope.
- **`call`** - evaluate each operand, look up the operator, call it with the evaluated args.

What the evaluator walks is plain nested arrays - the same expression in Lyre and in the exact JavaScript object the evaluator receives:

```lisp
(sine (+ 440 10))
```

```javascript
["sine", ["+", "440", "10"]]
```

Every leaf is a string until evaluation. Numbers are parsed, names are looked up, and the tree drives itself. There are no macros, no lazy evaluation, no short-circuiting. Every argument is fully evaluated before the function sees it. This is as simple as an evaluator gets.

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

## `let` - the only special form

`let` binds names to values in a new scope:

```lisp
(let (name1 value1 name2 value2 ...)
  body1 body2 ...)
```

Bindings are sequential - later bindings can reference earlier ones. Multiple bodies are sequenced. The bound names shadow anything in the enclosing scope.

```lisp
(let (root 220 fifth (* root 1.5))
  =(
    (envelope 0.01 1.0 0 0.5 (gate 1.51 (sine root)))
    (envelope 0.01 1.0 0 0.5 (gate 1.51 (sine fifth)))))
```

`let` is the only form the evaluator handles specially. Everything else - `envelope`, `gate`, `play`, `sine` - goes through the same evaluate-then-call path.

## What's next

The language is deliberately small. Two things would let it grow without losing that:

- **Patches** /user-defined functions/. A `patch` special form returning a callable would let users compose reusable shapes - n-pole filters, notch and band-pass built from lowpass plus highpass, custom envelopes - without touching the engine primitives.
- **Modules and imports**. Separating the mechanical parts of a piece /scales, patterns, patches/ from the piece itself, and sharing them between pieces.

Error reporting is a third thing missing, but that's plumbing, not design.
