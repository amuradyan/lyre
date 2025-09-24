# Lyre Audio Engine Integration Notes

## Technical Insights for Future Development

**Generator Architecture:**
- Convert shvi's `generatePCM(frequency, duration)` from returning `Int16Array` to `function* generatePCM()` that yields individual samples
- The key insight: instead of `return [...attack, ...sustain, ...decay]`, use `yield* attack; yield* sustain; yield* decay`
- This enables infinite-length audio generation with constant memory usage

**Composition Strategy:**
- `sequence(gen1, gen2)` becomes `function* sequence() { yield* gen1; yield* gen2; }`
- `parallel(gen1, gen2)` becomes real-time sample mixing: `yield (s1.value || 0) + (s2.value || 0)`
- Each function transforms from array concatenation to sample stream chaining

**AudioWorklet Integration:**
- The worklet calls `generator.next()` in 128-sample chunks during `process()` 
- No setTimeout gaps - timing happens in audio thread, not main thread
- Worklet creates generators on-demand: `this.generator = generatePCM(frequency, duration)`

**Critical Technical Challenge:**
- shvi's functions expect arrays for length calculations and indexing
- Generator approach sacrifices this for streaming capability
- Need to rethink envelope timing: instead of "fade over N samples", track current position and apply envelope math per sample

**Proven Approach:**
- Start with single-note streaming (we have this working)
- Next: generator-based sequence chaining
- Finally: parallel mixing of multiple generators
- Keep shvi's envelope math but apply it incrementally

**Architecture:**
`Lyre parser → generator creation → AudioWorklet consumption → audio output`

The fundamental shift: from "build complete arrays then play" to "generate samples as needed". This requires rewriting every audio function as a generator but enables browser-based music programming at any length.

## Development Practice Lessons

**On System Design:**
- The "simplest working solution" (sequential indexing) isn't always wrong - it was appropriate until requirements changed
- When building systems, consider how they'll behave when content is added/removed/reordered
- Content-based identification is more robust than position-based for persistent storage

**On Code Quality:**
- Distinguishing between demo code and interactive exercises improves user experience
- Generic, reusable components (like the streaming audio player) are more valuable than tool-specific ones
- Content hashing provides stable identity that survives refactoring

**On Development Process:**
- Static analysis (like detecting blocks without tests) can drive UX improvements automatically
- Small changes (adding static blocks) can reveal hidden assumptions in other parts of the system
- Git commit messages should reflect whether something is a feature (⚡) vs fix (🩹) - the original sequential indexing wasn't a "bug"

**On Integration Strategy:**
- Build *tool-agnostic components* - the streaming audio player should accept any PCM stream, not just Lyre output
- Separate *synthesis from playback* - keep Lyre interpreter pure, feed results to generic audio players
- Use *AudioWorklet* for real-time generation in browser, not main thread timers (setTimeout creates gaps)