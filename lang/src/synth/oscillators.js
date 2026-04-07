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

raw.sine.atPhase     = (phase) => Math.sin(phase);
raw.sawtooth.atPhase = (phase) => -1 + 2 * (phase / (2 * Math.PI));
raw.square.atPhase   = (phase) => phase < Math.PI ? 1 : -1;
raw.triangle.atPhase = (phase) => {
  const normalized = phase / (2 * Math.PI);
  return normalized < 0.5 ? -1 + 4 * normalized : 3 - 4 * normalized;
};

/**
 * Drives an oscillator with a varying frequency from a generator.
 * Reads a fresh frequency per sample and recomputes phase increment.
 * @param {Function} atPhase - Waveform formula taking phase, returning sample
 * @param {Generator} freqGen - Generator yielding [freq, n, totalSamples] tuples
 * @yields {Array} Tuples of [sample, n, totalSamples]
 * @example
 * modulate(raw.sine.atPhase, wrap(raw.sine, 5)) // 5 Hz LFO controlling phase
 */
export function* modulate(atPhase, freqGen) {
  const sampleRate = getSampleRate();
  let phase = 0;
  let n = 0;
  while (true) {
    const next = freqGen.next();
    if (next.done) return;
    const freq = next.value[0];
    const totalSamples = next.value[2];
    yield [atPhase(phase), n, totalSamples];
    phase = (phase + (2 * Math.PI * freq) / sampleRate) % (2 * Math.PI);
    n = n + 1;
  }
}

/**
 * Wraps a raw oscillator into the tupled [sample, n, totalSamples] format.
 * Dispatches on parameter type: numbers use the raw oscillator directly,
 * generators delegate to modulate for per-sample frequency modulation.
 * @param {Function} oscillatorFn - A raw oscillator (e.g., raw.sawtooth)
 * @param {number|Generator} param - Frequency in Hz, value for dc, or a generator for modulation
 * @yields {Array} Tuples of [sample, n, totalSamples]
 * @example
 * wrap(raw.sawtooth, 440)              // fixed frequency
 * wrap(raw.sine, wrap(raw.sine, 5))    // vibrato source
 */
export function* wrap(oscillatorFn, param) {
  if (typeof param?.next === 'function') {
    yield* modulate(oscillatorFn.atPhase, param);
    return;
  }

  const osc = oscillatorFn(param);
  let n = 0;
  while (true) {
    yield [osc.next().value, n, Infinity];
    n = n + 1;
  }
}
