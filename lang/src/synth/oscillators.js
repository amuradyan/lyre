/**
 * Audio sampling rate in Hz
 * Uses the global SAMPLE_RATE set by AudioWorklet, falls back to 48000
 * @type {number}
 */
const getSampleRate = () => globalThis.SAMPLE_RATE || 48000;

/**
 * Raw oscillators - yield plain audio samples between -1 and 1.
 * Use wrap() to convert to the tupled format for the Lyre pipeline.
 * @example
 * const osc = raw.sine(440);
 * for (const sample of osc) { // yields: 0, 0.062, 0.123, ... }
 */
export const raw = {
  *sine(frequency) {
    let phase = 0;
    const phaseIncrement = (2 * Math.PI * frequency) / getSampleRate();

    while (true) {
      yield Math.sin(phase);
      phase = phase + phaseIncrement;
    }
  },

  *sawtooth(frequency) {
    let phase = 0;
    const phaseIncrement = (2 * Math.PI * frequency) / getSampleRate();

    while (true) {
      yield -1 + 2 * (phase / (2 * Math.PI));
      phase = phase + phaseIncrement;

      if (phase >= 2 * Math.PI) {
        phase = phase - 2 * Math.PI;
      }
    }
  },

  *square(frequency) {
    let phase = 0;
    const phaseIncrement = (2 * Math.PI * frequency) / getSampleRate();

    while (true) {
      yield phase < Math.PI ? 1 : -1;
      phase = phase + phaseIncrement;

      if (phase >= 2 * Math.PI) {
        phase = phase - 2 * Math.PI;
      }
    }
  },

  *triangle(frequency) {
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
  },

  *dc(value) {
    while (true) {
      yield value;
    }
  },
};

/**
 * Wraps a raw oscillator into the tupled [sample, n, Infinity] format.
 * @param {Function} oscillatorFn - A raw oscillator (e.g., raw.sawtooth)
 * @param {number} param - Frequency in Hz, or value for dc
 * @yields {Array} Tuples of [sample, n, totalSamples] where totalSamples is Infinity
 * @example
 * const sawTone = wrap(raw.sawtooth, 440);
 * for (const [sample, n, totalSamples] of sawTone) { ... }
 */
export function* wrap(oscillatorFn, param) {
  const osc = oscillatorFn(param);
  let n = 0;

  while (true) {
    const sample = osc.next().value;
    yield [sample, n, Infinity];
    n = n + 1;
  }
}
