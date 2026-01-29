/**
 * Plays generators sequentially, one after another.
 * @param {...Generator} generators - Audio generators to play in sequence
 * @yields {number} Audio samples from each generator in order
 * @example
 * const melody = sequence(
 *   envelope(tone(261.63), 0.01, 0.1, 0.7, 0.2), // C
 *   envelope(tone(293.66), 0.01, 0.1, 0.7, 0.2), // D
 *   envelope(tone(329.63), 0.01, 0.1, 0.7, 0.2)  // E
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
 *   envelope(tone(261.63), 0.01, 1.0, 0, 0.5), // C
 *   envelope(tone(329.63), 0.01, 1.0, 0, 0.5), // E
 *   envelope(tone(392.00), 0.01, 1.0, 0, 0.5)  // G
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
 * Repeats a generator function N times.
 * @param {number} times - Number of repetitions
 * @param {Function} generatorFunc - Function that returns a new generator each call
 * @yields {number} Audio samples from repeated generators
 * @example
 * const repeated = repeat(3, () => envelope(tone(440), 0.01, 0.1, 0.7, 0.2));
 * // Plays the same note 3 times
 */
export function* repeat(times, generatorFunc) {
  for (let i = 0; i < times; i++) {
    yield* generatorFunc();
  }
}
