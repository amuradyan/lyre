const getSampleRate = () => globalThis.SAMPLE_RATE || 48000;

/**
 * Applies a low-pass filter to smooth the signal and remove high frequencies.
 * @param {Generator} source - Source audio generator
 * @param {number} cutoff - Cutoff frequency in Hz
 * @yields {number} Filtered audio samples between -1 and 1
 * @example
 * const mellow = filter(sawtooth(220), 1000);
 * // Smooths the sawtooth wave, removing frequencies above 1000 Hz
 */
export function* filter(source, cutoff) {
  const samplingRate = getSampleRate();
  const alpha = cutoff / samplingRate;
  let y = 0;

  for (const x of source) {
    y = y + alpha * (x - y);
    yield y;
  }
}

/**
 * Applies a low-pass filter with a cutoff that sweeps over time.
 * Useful for creating evolving timbres.
 * @param {Generator} source - Source audio generator
 * @param {number} startCutoff - Initial cutoff frequency in Hz
 * @param {number} endCutoff - Final cutoff frequency in Hz
 * @param {number} decayTime - Time in seconds for the sweep
 * @yields {number} Filtered audio samples between -1 and 1
 * @example
 * const sweep = filterEnvelope(sawtooth(220), 2000, 500, 2.0);
 * // Filter sweeps from 2000Hz to 500Hz over 2 seconds
 */
/**
 * Tuple-aware low-pass filter with fixed or modulated cutoff.
 * @param {Generator} source - Source audio generator yielding [sample, n, totalSamples]
 * @param {number|Generator} cutoffParam - Cutoff frequency in Hz, or a generator yielding [cutoff, n, total]
 * @yields {Array} Filtered tuples of [sample, n, totalSamples]
 * @example
 * lowpassTupled(tone(440), 2000) // fixed cutoff
 * lowpassTupled(tone(440), envelopeGen) // modulated cutoff
 */
export function* lowpassTupled(source, cutoffParam) {
  const samplingRate = getSampleRate();
  const cutoffIsGen = typeof cutoffParam?.next === 'function';
  let y = 0;
  let lastCutoff = 0;

  for (const [sample, n, totalSamples] of source) {
    let cutoff;
    if (cutoffIsGen) {
      const next = cutoffParam.next();
      cutoff = next.done ? lastCutoff : next.value[0];
      if (!next.done) lastCutoff = cutoff;
    } else {
      cutoff = cutoffParam;
    }
    const alpha = cutoff / samplingRate;
    y = y + alpha * (sample - y);
    yield [y, n, totalSamples];
  }
}

/**
 * Tuple-aware high-pass filter with fixed or modulated cutoff.
 * @param {Generator} source - Source audio generator yielding [sample, n, totalSamples]
 * @param {number|Generator} cutoffParam - Cutoff frequency in Hz, or a generator yielding [cutoff, n, total]
 * @yields {Array} Filtered tuples of [sample, n, totalSamples]
 * @example
 * highpassTupled(tone(440), 200) // fixed cutoff
 * highpassTupled(tone(440), envelopeGen) // modulated cutoff
 */
export function* highpassTupled(source, cutoffParam) {
  const samplingRate = getSampleRate();
  const cutoffIsGen = typeof cutoffParam?.next === 'function';
  let y = 0;
  let lastCutoff = 0;

  for (const [sample, n, totalSamples] of source) {
    let cutoff;
    if (cutoffIsGen) {
      const next = cutoffParam.next();
      cutoff = next.done ? lastCutoff : next.value[0];
      if (!next.done) lastCutoff = cutoff;
    } else {
      cutoff = cutoffParam;
    }
    const alpha = cutoff / samplingRate;
    y = y + alpha * (sample - y);
    yield [sample - y, n, totalSamples];
  }
}

