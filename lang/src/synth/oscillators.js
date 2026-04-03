/**
 * Audio sampling rate in Hz
 * Uses the global SAMPLE_RATE set by AudioWorklet, falls back to 48000
 * @type {number}
 */
const getSampleRate = () => globalThis.SAMPLE_RATE || 48000;

/**
 * Exported for backward compatibility
 * @deprecated Use getSampleRate() for dynamic sample rate
 */
export const samplingRate = getSampleRate();

/**
 * Generates an infinite sine wave at the given frequency.
 * @param {number} frequency - Frequency in Hz
 * @yields {number} Audio samples between -1 and 1
 * @example
 * const wave = oscillate(440); // A4
 * for (const sample of wave) {
 *   // yields: 0, 0.062, 0.123, ...
 * }
 */
export function* oscillate(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / getSampleRate();

  while (true) {
    yield Math.sin(phase);
    phase = phase + phaseIncrement;
  }
}

/**
 * Generates an infinite sine wave tone at the given frequency.
 * @param {number} frequency - Frequency in Hz
 * @yields {Array} Tuples of [sample, n, totalSamples] where totalSamples is Infinity
 * @example
 * const c4 = tone(261.63); // Middle C
 * for (const [sample, n, totalSamples] of c4) {
 *   // yields: [0, 0, Infinity], [0.062, 1, Infinity], ...
 * }
 */
export function* tone(frequency) {
  const osc = oscillate(frequency);
  let n = 0;

  while (true) {
    const sample = osc.next().value;
    yield [sample, n, Infinity];
    n = n + 1;
  }
}

/**
 * Generates an infinite sawtooth wave at the given frequency.
 * A sawtooth wave is richer in harmonics than a sine wave.
 * @param {number} frequency - Frequency in Hz
 * @yields {number} Audio samples between -1 and 1
 * @example
 * const saw = sawtooth(220);
 * for (const sample of saw) {
 *   // yields sawtooth wave samples
 * }
 */
export function* sawtooth(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / getSampleRate();

  while (true) {
    const value = -1 + 2 * (phase / (2 * Math.PI));

    yield value;
    phase = phase + phaseIncrement;

    if (phase >= 2 * Math.PI) {
      phase = phase - 2 * Math.PI;
    }
  }
}

/**
 * Generates an infinite square wave at the given frequency.
 * Contains only odd harmonics, each at 1/n amplitude - hollow, clarinet-like.
 * @param {number} frequency - Frequency in Hz
 * @yields {number} Audio samples, either -1 or 1
 * @example
 * const sq = square(440);
 * for (const sample of sq) {
 *   // yields: 1, 1, ..., -1, -1, ...
 * }
 */
export function* square(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / getSampleRate();

  while (true) {
    yield phase < Math.PI ? 1 : -1;
    phase = phase + phaseIncrement;

    if (phase >= 2 * Math.PI) {
      phase = phase - 2 * Math.PI;
    }
  }
}

/**
 * Generates an infinite triangle wave at the given frequency.
 * Contains only odd harmonics, each at 1/n² amplitude - softer than square, close to sine.
 * @param {number} frequency - Frequency in Hz
 * @yields {number} Audio samples between -1 and 1
 * @example
 * const tri = triangle(220);
 * for (const sample of tri) {
 *   // yields triangle wave samples
 * }
 */
export function* triangle(frequency) {
  let phase = 0;
  const phaseIncrement = (2 * Math.PI * frequency) / getSampleRate();

  while (true) {
    const normalized = phase / (2 * Math.PI);
    yield normalized < 0.5
      ? -1 + 4 * normalized
      : 3 - 4 * normalized;
    phase = phase + phaseIncrement;

    if (phase >= 2 * Math.PI) {
      phase = phase - 2 * Math.PI;
    }
  }
}

/**
 * Wraps any raw oscillator function into the tupled [sample, n, Infinity] format.
 * @param {Function} oscillatorFn - A raw oscillator generator function (e.g., sawtooth, square)
 * @param {number} frequency - Frequency in Hz
 * @yields {Array} Tuples of [sample, n, totalSamples] where totalSamples is Infinity
 * @example
 * const sawTone = toneWith(sawtooth, 440);
 * for (const [sample, n, totalSamples] of sawTone) {
 *   // yields: [sample, 0, Infinity], [sample, 1, Infinity], ...
 * }
 */
/**
 * Generates a constant signal at the given value.
 * @param {number} value - The constant value to yield
 * @yields {Array} Tuples of [value, n, Infinity]
 * @example
 * const one = dc(1);
 * for (const [sample, n, totalSamples] of one) {
 *   // yields: [1, 0, Infinity], [1, 1, Infinity], ...
 * }
 */
export function* dc(value) {
  let n = 0;
  while (true) {
    yield [value, n, Infinity];
    n = n + 1;
  }
}

export function* toneWith(oscillatorFn, frequency) {
  const osc = oscillatorFn(frequency);
  let n = 0;

  while (true) {
    const sample = osc.next().value;
    yield [sample, n, Infinity];
    n = n + 1;
  }
}
