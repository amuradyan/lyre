# Lyre architecture

## Core Principles

**Streaming**: No buffering or consuming entire generators. Everything streams sample-by-sample for browser performance.

**Metadata tuples**: Generators yield `[sample, n, totalSamples]` instead of bare samples. This carries duration context without pre-computation or exhaustion.

**Pure composition**: Combinators like `sequence` and `parallel` pass through metadata unchanged. They don't compute global totals or assume complete structure.

## Component Types

**Sources** (pure audio generation):

- `oscillator(frequency, sampleRate)` → infinite generator, yields raw samples (no tuples), maintains phase
- `tone(frequency, duration, sampleRate)` → yields `[sample, n, totalSamples]` tuples
- `silence(duration, sampleRate)` → yields `[0, n, totalSamples]` tuples
- `sequence(...generators)` → pure passthrough, chains generators preserving metadata
- `harmony(...generators)` → mixes tuples, yields `[mixedSample, maxN, maxTotal]` tuples

**Transforms** (signal shaping):

- `envelope(source, adsr=[0.01, 0.4, 0.8, 0.6])` → reads tuples, applies ADSR, **yields tuples** `[shaped, n, total]`
- `filter(source, cutoff)` → shapes frequency content (future)

**Key insight:** Transforms preserve tuples! This enables full composability in any order:
- `envelope(sequence(tone1, tone2))` ✅
- `sequence(envelope(tone1), envelope(tone2))` ✅
- `envelope(harmony(tone1, tone2))` ✅

**Output adapter:**

- `extractSamples(source)` → reads tuples, yields plain numbers for AudioWorklet

**Helper functions:**

- `computeAmplitude(n, totalSamples, adsr)` → pure function computing ADSR envelope value at sample `n`

## Signal Chain

Standard synthesis path: Oscillator → Filter → Envelope

Sources generate audio with timing context. Transforms shape the signal using that context. Pure passthrough composition keeps everything streaming.

## Actual Pipeline

User code → Evaluator → Generator (yields tuples) → **Auto-envelope** → extractSamples → AudioWorklet → Speaker

**Automatic envelope wrapping**: The AudioWorklet processor automatically wraps all top-level expressions with default ADSR `[0.01, 0.4, 0.8, 0.6]` before extraction. This provides:

- Backward compatibility: `(tone C4 500)` works without explicit envelope
- User override: `(envelope (tone C4 500) [custom adsr])` bypasses auto-wrapping
- Clean architecture: tuples preserved throughout the pipeline

Code example:

```lisp
; User writes
(sequence (tone C4 500) (tone D4 500))

; Evaluator produces
generator → [sample, n, total] tuples

; Worklet wraps
envelope(generator) → [shaped, n, total] tuples

; Then extracts
extractSamples → plain numbers → audio output
```
