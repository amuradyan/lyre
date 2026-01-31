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
