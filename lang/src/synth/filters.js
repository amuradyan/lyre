import { samplingRate } from './oscillators.js';

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
export function* filterEnvelope(source, startCutoff, endCutoff, decayTime) {
  const decaySamples = decayTime * samplingRate;
  let y = 0;
  let n = 0;

  for (const x of source) {
    const progress = Math.min(1, n / decaySamples);
    const cutoff = startCutoff + (endCutoff - startCutoff) * progress;
    const alpha = cutoff / samplingRate;

    y = y + alpha * (x - y);
    yield y;

    n = n + 1;
  }
}
