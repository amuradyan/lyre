# Motion Becomes a List (Arrays)
<!-- slide-id: c3d4e5f6-a7b8-9012-cdef-345678901234 -->

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

## Interactive Lyre Demo

Try the Lyre musical programming language! Edit the code and click "Run Lyre" to hear your changes:

```lyre
(tone C4 500)
```

Play multiple notes at the same time:

```lyre
(harmony (tone C4 200) (tone B4 200) (tone A4 400))
```

Create sequences:

```lyre
(sequence (tone C4 200) (tone D4 200) (tone E4 200))
```

## Back

- [Describing Functions](notes/Making%20a%20sound/1%20Describing%20Functions.md)
