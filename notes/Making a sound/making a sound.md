# Step 01 – Making a Sound (Exercise Base)

This step is split into two phases:

1. Gentle JavaScript On‑Ramp: Introduce ONLY the JavaScript elements needed later in the Shvi `generatePCM` implementation. Each mini‑topic has 1–2 focused micro‑exercises.
2. Combining Concepts: Short applied exercises that progressively resemble parts of the real audio sample generator (without revealing the full implementation yet).

The goal: by the time learners see `generatePCM`, every construct inside it feels already familiar.

---

## Phase 1: Gentle JavaScript On‑Ramp

### 1. Numbers & Arithmetic

We need number literals, addition, subtraction, multiplication, division, exponent, and parentheses.

Concept focus: numeric literals, operator precedence, parentheses for clarity.

Exercises:

1. Compute the number of milliseconds in 3.5 seconds. (Expect: 3500)
2. Given a wave completes 440 cycles per second, how many cycles in 0.25 seconds? (Formula: `frequency * seconds`)
3. Evaluate `(2 + 3 * 4) - 5` and then the parenthesized version `((2 + 3) * 4) - 5`. Describe the difference.

Note: We'll apply parentheses meaningfully when we build the sine expression and envelopes below instead of over‑explaining here.

### 2. Variables: `const` vs `let`

We need stable constants (sample rate, amplitude) and loop counters.

Rule of thumb: default to `const`; use `let` only when you MUST reassign.

Exercises:

1. Declare `const SAMPLE_RATE = 44100;` and `const DURATION_MS = 250;`. Compute total samples: `Math.floor(SAMPLE_RATE * (DURATION_MS / 1000))`.
2. Try to reassign `SAMPLE_RATE = 48000;` – observe the error (do NOT remove the line; comment it and explain why it fails).
3. Use `let counter = 0;` then `counter = counter + 1;` twice. Log the final value and rewrite using `counter += 1;`.

### 3. Functions (Declaration + Parameters + Return)

We need function declarations, parameters with default values, and returning a value.

Exercises:

1. Write `function msToSeconds(ms) { /* ... */ }` returning milliseconds converted to seconds.
2. Extend it: add a default parameter `ms = 1000` and call without an argument.
3. Write `function cycles(frequency, ms) { return frequency * msToSeconds(ms); }` and test with `(440, 250)`.

### 4. Classic `for` Loop

We need counter control to iterate a fixed number of times.

Exercises:

1. Loop from 0 to 4 (inclusive) and log the index.
2. Sum the numbers 1..100 using a `for` loop. (Store in `let total = 0;`).
3. Create an empty array `samples = []` and push the index squared for i = 0..5 → expect `[0,1,4,9,16,25]`.

### 5. Arrays & `push`

We will accumulate sample values.

Exercises:

1. Start with `const values = [];` Push numbers 1 through 5 using a loop.
2. Write `function range(n)` returning an array `[0,1,...,n-1]` by pushing inside a loop.
3. Use `range(8)` and verify length is 8.

### 6. Math API (`Math.sin`, `Math.PI`, `Math.floor`)

Used for waveform generation and integer truncation.

Exercises:

1. Compute `Math.sin(0)`, `Math.sin(Math.PI / 2)`, `Math.sin(Math.PI)` – record outputs (expect 0, 1, ~0).
2. Given `t = 0.001` seconds and `frequency = 440`, compute one sample: `Math.sin(2 * Math.PI * frequency * t)`.
3. Use a loop for the first 5 samples at `t = i / 44100` (i = 0..4) – store in an array.
4. Show difference: `Math.floor(3.999)` vs `Math.floor(4.001)`.

### 7. Putting a Fade Factor (Simple Scaling)

Envelope shaping uses multiplication by a fraction.

Exercises:

1. Compute a linear fade-in factor for step `i` out of `N=5`: `i / N` for i = 0..5 (store array → `[0,0.2,0.4,0.6,0.8,1]`).
2. Multiply each fade factor by a constant amplitude `AMPLITUDE = 10`.
3. Combine with a sine: `Math.sin(i) * (i / 5)` for i = 0..5.

### 8. Default Parameters (Preview Only)

We will use `offset = 0` later.

Exercises:

1. Write `function add(a, b = 10) { return a + b; }` and test `add(5)` vs `add(5, 2)`.
2. Write `function sampleTime(i, sampleRate = 44100) { return i / sampleRate; }` Test with `i=22050`.

---

## Phase 2: Combining Concepts

Now we mirror pieces of the real `generatePCM` function while still keeping scope small.

### Combined Exercise 1: Seconds → Total Samples

Write `function totalSamples(durationMs, sampleRate = 44100)` returning the integer number of samples. Use `Math.floor`. Test with 250 ms (should be 11025 at 44.1 kHz).

### Combined Exercise 2: Mini Sine Burst

Write `function sineBurst(frequency, durationMs)` that:

- Computes `total = totalSamples(durationMs)`
- Loops `i = 0..total-1`
- Computes `t = i / 44100`
- Pushes raw (unscaled) sine samples into an array
- Parentheses check: the angle should be `2 * Math.PI * frequency * t` inside `Math.sin(...)`. Do NOT write `Math.sin(2 * Math.PI * (frequency + t))`.
Return the array and log its length.

### Combined Exercise 3: Add Linear Fade-In

Extend `sineBurst` into `sineBurstWithFadeIn`:

- Define `fadePortion = 0.1` (first 10% of samples are fading)
- Compute `fadeSamples = Math.floor(total * fadePortion)`
- If `i < fadeSamples` multiply sample by `(i / fadeSamples)`, else leave raw
Return the array.

### Combined Exercise 4: Parametric Amplitude

Add parameter `amplitude = 32767` and scale every sample by it.

Precedence reminder: `amplitude * raw * fade` is fine because `*` is left‑to‑right. If you later divide, use parentheses where intent could be unclear.

### Combined Exercise 5: Extract Helper

Refactor fade computation into inner helper:

```js
function sineBurstWithFadeIn(frequency, durationMs, amplitude = 32767) {
  const total = totalSamples(durationMs);
  const fadeSamples = Math.floor(total * 0.1);
  function fadeFactor(i) { return i < fadeSamples ? (i / fadeSamples) : 1; }
  // build samples using fadeFactor(i) and expression: amplitude * raw * fadeFactor(i)
}
```

### Combined Exercise 6: Offset Start (Preview of `offset`)

Add an `offsetSamples = 500` argument. Compute `t = (offsetSamples + i) / 44100`. Observe phase shift compared to starting at 0.

### Combined Exercise 7: Envelope Pieces (Attack/Sustain/Decay Skeleton)

Simulate three phases without full correctness:

- Attack: first 5% scaling `(i / attackSamples)`
- Sustain: flat 90%
- Decay: final 5% scaling `((decaySamples - j) / decaySamples)`
Return concatenated array. (This foreshadows the real implementation.)

### Combined Exercise 8 (Capstone Mini): Assemble Pseudo-`generatePCM`

Implement:

```js
function pseudoGeneratePCM(freq, durationMs, amplitude = 32767) {
  const total = totalSamples(durationMs);
  const samples = [];
  for (let i = 0; i < total; i++) {
    const t = i / 44100;
    // Angle = 2 * PI * freq * t  (all multiplication — parentheses not required, but kept grouped for readability)
    const raw = Math.sin(2 * Math.PI * freq * t);
    const fade = i < total * 0.1 ? (i / (total * 0.1)) : 1; // simple attack only
    samples.push(amplitude * raw * fade);
  }
  return samples;
}
```

Parentheses reflection: identify every place you deliberately grouped to make intent obvious.

---

## Reflection Prompts

Use these short questions to ensure internalization:

- Why do we use `Math.floor` when computing total samples?
- What happens if we forget `const` and use implicit globals?
- How does changing `offset` affect the sine wave visually (phase)?
- Why scale by `(i / fadeSamples)` instead of `(i / total)` during attack?

---

## Instructor Notes (Meta)

- Keep learners in the REPL / console early; no file editing needed until combination tasks.
- Encourage console logging arrays (first 10 elements), not the entire long arrays.
- Delay any mention of typed arrays (`Int16Array`) until the NEXT micro‑step after confidence with plain JS arrays.
- Avoid premature optimization talk—clarity over performance.

---

## Ready for Transition

Once learners comfortably finish Combined Exercise 8 and can explain each line, they are ready to see the real `generatePCM` and map each piece:

- `totalSamples` calculation
- Loop structure
- Time `t` computation
- Sine formula
- Fade factor(s)
- Accumulation via `push`

At that point, reveal the authentic function and let them annotate it using the vocabulary built here.
