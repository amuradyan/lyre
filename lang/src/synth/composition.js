/**
 * Plays generators sequentially, one after another.
 * @param {...Generator} generators - Audio generators to play in sequence
 * @yields {number} Audio samples from each generator in order
 * @example
 * const melody = sequence(
 *   envelope(0.01, 0.1, 0.7, 0.2, tone(261.63)),  // C
 *   envelope(0.01, 0.1, 0.7, 0.2, tone(293.66)),  // D
 *   envelope(0.01, 0.1, 0.7, 0.2, tone(329.63))   // E
 * );
 */
export function* sequence(...generators) {
  for (const gen of generators) {
    yield* gen;
  }
}

/**
 * Mixes generators in parallel by summing their samples.
 * Stops when all generators finish.
 * @param {...Generator} generators - Audio generators to mix
 * @yields {Array} Tuples of [sample, n, maxTotalSamples] where sample is the sum
 * @example
 * const chord = harmony(
 *   envelope(0.01, 1.0, 0, 0.5, tone(261.63)),  // C
 *   envelope(0.01, 1.0, 0, 0.5, tone(329.63)),  // E
 *   envelope(0.01, 1.0, 0, 0.5, tone(392.00))   // G
 * );
 */
export function* harmony(...generators) {
  let n = 0;
  let maxTotalSamples = 0;

  while (true) {
    let sum = 0;
    let allDone = true;

    for (const gen of generators) {
      const { value, done } = gen.next();
      if (!done) {
        const [sample, _, totalSamples] = value;
        sum = sum + sample;
        if (totalSamples > maxTotalSamples) {
          maxTotalSamples = totalSamples;
        }
        allDone = false;
      }
    }

    if (allDone) {
      return;
    }

    yield [sum, n, maxTotalSamples];
    n = n + 1;
  }
}

/**
 * Mixes generators in parallel, normalizing by voice count to prevent clipping.
 * Wraps harmony and divides each sample by the number of generators.
 * @param {...Generator} generators - Audio generators to mix
 * @yields {Array} Tuples of [sample, n, maxTotalSamples] where sample is the normalized sum
 * @example
 * const chord = mix(
 *   envelope(0.01, 1.0, 0, 0.5, tone(261.63)),  // C
 *   envelope(0.01, 1.0, 0, 0.5, tone(329.63)),  // E
 *   envelope(0.01, 1.0, 0, 0.5, tone(392.00))   // G
 * );
 */
export function* mix(...generators) {
  for (const sample of harmony(...generators)) {
    const [s, n, totalSamples] = sample;
    yield [s / generators.length, n, totalSamples];
  }
}

/**
 * Repeats a generator function N times.
 * @param {number} times - Number of repetitions
 * @param {Function} generatorFunc - Function that returns a new generator each call
 * @yields {number} Audio samples from repeated generators
 * @example
 * const repeated = repeat(3, () => envelope(0.01, 0.1, 0.7, 0.2, tone(440)));
 * // Plays the same note 3 times
 */
export function* repeat(times, generatorFunc) {
  for (let i = 0; i < times; i++) {
    yield* generatorFunc();
  }
}
