/**
 * Applies a low-pass filter to smooth the signal and remove high frequencies.
 */
export function filter(source: Generator<number>, cutoff: number): Generator<number>;

/**
 * Applies a low-pass filter with a cutoff that sweeps over time.
 */
export function filterEnvelope(
  source: Generator<number>,
  startCutoff: number,
  endCutoff: number,
  decayTime: number
): Generator<number>;
