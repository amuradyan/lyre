const getSampleRate = () => globalThis.SAMPLE_RATE || 48000;

/**
 * Low-pass filter with fixed or modulated cutoff.
 * @param {Generator} source - Source audio generator yielding [sample, n, totalSamples]
 * @param {number|Generator} cutoffParam - Cutoff frequency in Hz, or a generator yielding [cutoff, n, total]
 * @yields {Array} Filtered tuples of [sample, n, totalSamples]
 * @example
 * lowpass(tone(440), 2000) // fixed cutoff
 * lowpass(tone(440), envelopeGen) // modulated cutoff
 */
export function* lowpass(source, cutoffParam) {
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
 * High-pass filter with fixed or modulated cutoff.
 * @param {Generator} source - Source audio generator yielding [sample, n, totalSamples]
 * @param {number|Generator} cutoffParam - Cutoff frequency in Hz, or a generator yielding [cutoff, n, total]
 * @yields {Array} Filtered tuples of [sample, n, totalSamples]
 * @example
 * highpass(tone(440), 200) // fixed cutoff
 * highpass(tone(440), envelopeGen) // modulated cutoff
 */
export function* highpass(source, cutoffParam) {
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
