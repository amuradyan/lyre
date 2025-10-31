# Lyre architecture

## Core Principles

**Streaming**: No buffering or consuming entire generators. Everything streams sample-by-sample for browser performance.

**Metadata tuples**: Generators yield `[sample, n, totalSamples]` instead of bare samples. This carries duration context without pre-computation or exhaustion.

**Pure composition**: Combinators like `sequence` and `parallel` pass through metadata unchanged. They don't compute global totals or assume complete structure.

## Component Types

**Sources** (pure audio generation):

- `oscillator(frequency)` → yields `[sample, ∞, ∞]` - infinite waveform with phase tracking
- `tone(frequency, duration)` → yields `[sample, n, totalSamples]` - finite, scoped by duration
- `sequence([tone1, tone2, ...])` → chains sources, passes through each source's metadata
- `parallel([tone1, tone2, ...])` → mixes sources simultaneously (future)

**Transforms** (signal shaping):

- `envelope(source, adsr)` → applies amplitude shaping using metadata from source
- `filter(source, cutoff)` → shapes frequency content (future)

Transforms read `[sample, n, totalSamples]` from sources to make real-time decisions (e.g., ADSR needs `n` and `totalSamples` to compute release timing). Each tone in a sequence maintains its own timing metadata, so envelope shapes each independently.

## Signal Chain

Standard synthesis path: Oscillator → Filter → Envelope

Sources generate audio with timing context. Transforms shape the signal using that context. Pure passthrough composition keeps everything streaming.
