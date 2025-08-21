# Step 01 · Making a Sound (Narrative Slides)

Purpose: Grow a single clear idea: a tone is just many tiny height measurements of a repeating curve over time. We learn only the JavaScript needed to express that.

Target line we want to truly understand (not memorize):

```js
sample = AMPLITUDE * Math.sin(2 * Math.PI * frequency * t)
```

Final goal call (example):

```js
generatePCM(440, 2000) // → array of ~88200 samples (2 seconds @ 44.1 kHz)
```

---

## Slide 0 · Describing Sound

Picture gently tapping a table at a perfectly steady pace: up, down, up, down. If we could freeze time thousands of times each second and note how far "up" or "down" the motion is, that ordered list of tiny numbers is all the computer needs for one plain beep. More snapshots (samples) make the playback feel continuous.

We are starting our journey to make the computer play music; step one is learning how to express a single, steady vibration as data.

We will: (time) → (count samples) → (loop across indices) → (compute angle) → (take sine) → (scale by chosen amplitude).

---

## Slide 1 · A Reusable Spell (Functions)

We want to be able to describe the machine it's function, and tell it to perform /call the function/, and this is how we do it in JavaScript.

!!NOTE: The snippet below should be the excercise with the test section below

```js
function ___() {
  return "beep"; // returning a value lets callers use it
}

___();
```

!!NOTE TO SELF!!: if the student messes with the code, respond with a message about importance of the name actually describing the function and not just being a random word. Note that in real life nothing would stop him from doing it wrong.

Note the `()` after the name: it means "call this function". Calling `beep()` gives back data. This is very helpful because we will be doing a lot of manipulations with data.

Exercises:

1. Come up with a name for the function that describes what it does, write `function say(word) { return word; }` then call `say("hello")` in the code above.

---

## Slide 2 · Motion Becomes a List (Arrays)

A wave is motion through time. To model motion we first capture a crude cycle manually: positions rising, peaking, falling, resting. We only care about one dimension (height), so a simple list works.

```js
function coarseWave() {
  return [0, 1, 0, -1, 0]; // cartoon of one up/down cycle
}
```

Arrays keep order: index 0 is “first moment”, index 1 the next, and so on. Soon we'll stop hand‑writing and start generating these numbers.

Exercises:

1. Log `coarseWave().length`.
2. Add an intermediate value between 1 and 0 near the descent (e.g. 0.5). What does that attempt to improve?
3. Comment: Why can’t we just always add infinite points?

---

## Slide 3 · Slicing a Circle (Angles)

A perfect cycle of a sine wave corresponds to travelling an angular distance of `2 * Math.PI` radians. If we want `n` evenly spaced samples of ONE cycle, each step advances by an equal angular slice.

```js
function angleStep(n) {
  return 2 * Math.PI / n;
}
```

If `n` doubles, the angle per step halves—finer granularity.

Exercises:

1. Log `angleStep(4)`, `angleStep(8)`, `angleStep(16)`.
2. In a comment, describe the trend (no formulas, just intuition).
3. Predict: If we used `angleStep(2)`, what would the resulting “wave” look like?

---

## Slide 4 · Let the Math Draw the Cycle (Loop + Math.sin)

Instead of guessing heights, we calculate them. For sample index `i`, the angle is `i * step` where `step = angleStep(n)`. We loop from `0` to `n - 1`, compute `Math.sin(angle)`, push it into an array.

```js
function sineCycle(n) {
  const step = angleStep(n);      // fixed per call
  const values = [];              // will grow
  for (let i = 0; i < n; i++) {   // classic counting loop
    values.push(Math.sin(step * i));
  }
  return values;                  // numbers in [-1, 1]
}
```

This introduces together—because they naturally belong together—`const` (unchanging), `let i` (changing counter), `for`, and `push`.

Exercises:

1. Log `sineCycle(8)`.
2. Log `sineCycle(32)`—compare smoothness.
3. Comment: Which part would you change to get an even smoother curve?

---

## Slide 5 · "Samples Per Second" Instead of “Samples Per Cycle”

Real audio is time‑driven: we adopt a global promise—sample exactly `SAMPLE_RATE` times every second.

```js
const SAMPLE_RATE = 44100; // samples / second
```

Frequency (Hz) means “cycles per second”. After `i` samples, elapsed time `t` in seconds is:

```js
t = i / SAMPLE_RATE;
```

One full sine wave angle at time `t` for a frequency `f` is `2 * Math.PI * f * t`.

**!NOTE**: elaborate more on this.

We can now compute a single raw (unscaled) sample:

```js
function rawSampleAt(frequency, i) {
  const t = i / SAMPLE_RATE;
  return Math.sin(2 * Math.PI * frequency * t);
}
```

Exercises:

1. Log first 5 values of `rawSampleAt(440, i)` for i = 0..4.
2. Repeat for 220 Hz; describe the difference.
3. Predict: What would doubling frequency do to how often zeros appear?

---

## Slide 6 · How Many Samples for a Duration? (Milliseconds)

We rarely want “exactly one second”—we want arbitrary durations. Milliseconds are a friendly input, sample counts are what we loop over.

```js
function totalSamples(durationMs) {
  return Math.floor(SAMPLE_RATE * (durationMs / 1000));
}
```

`Math.floor` discards any leftover fraction; you cannot store part of a sample.

Exercises:

1. Log `totalSamples(1000)` (should be 44100).
2. Log `totalSamples(250)` (≈ 11025).
3. Comment: Why not `Math.round`?

---

## Slide 7 · Loudness Scaling (Amplitude)

Sine gives us clean values in `[-1, 1]`. We choose an amplitude constant to control loudness (a simple multiplier). Later, when writing a file or mixing multiple sounds, we may revisit the exact range.

```js
const AMPLITUDE = 1; // simple full-scale multiplier for now
```

Scaling is simple multiplication.

Exercises:

1. Compute `AMPLITUDE * 1`, `AMPLITUDE * 0.5`, `AMPLITUDE * -1` (with AMPLITUDE = 1 these are unchanged—try another value like 0.8).
2. Write `function scale(raw) { return AMPLITUDE * raw; }`.
3. Show: `scale(rawSampleAt(440, 0))`.

---

## Slide 8 · Assemble the Generator (No Fades Yet)

We now have all pieces: duration → total samples; index → time; time + frequency → raw sine; raw → scaled value.

```js
function generatePCM(frequency, durationMs) {
  const total = totalSamples(durationMs);
  const samples = new Array(total);
  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    const raw = Math.sin(2 * Math.PI * frequency * t);
    samples[i] = AMPLITUDE * raw;
  }
  return samples; // plain array of numbers in roughly [-AMPLITUDE, AMPLITUDE]
}
```

Exercises:

1. Call `generatePCM(440, 500)`; log `length` (≈ 22050).
2. Call `generatePCM(440, 2000)`; log `length` (≈ 88200).
3. Inspect first 10 values and confirm several near zero (sine starts at 0 and crosses it repeatedly).

---

## Slide 9 · Hearing the Beep (Preview Only)

A future step will map these floating numbers into a file format. Conceptually:

```js
const samples = generatePCM(440, 2000);
// encodeWAV(samples, "tone.wav")  // added later
```

Until we integrate, validating length & pattern (oscillating positive/negative) shows success.

Exercises:

1. Store `const tone = generatePCM(523.25, 2000);` (C5). Log its length.
2. Generate A4 (440 Hz) and C5—compare first 12 values; which changes faster?
3. Comment: What single number would you change to shift pitch?

---

## Self‑Check (Answer Before Moving On)

1. Why divide by `SAMPLE_RATE` inside the loop?
2. What does `2 * Math.PI` guarantee about the angle domain per full cycle?
3. Why must we convert milliseconds to an integer sample count before looping?
4. What’s the only role of `AMPLITUDE` right now?
5. If frequency doubles, what changes inside the loop?

You are now ready for Step 02 (adding structure for describing sequences & later shaping volume). Fades / envelopes deliberately postponed.

Proceed to: [Step 02 – A Better Language for Instructions](./02-a-better-language-for-instructions.md)
