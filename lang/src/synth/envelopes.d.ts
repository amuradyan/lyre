/**
 * Applies an ADSR envelope to shape the amplitude of a source generator.
 */
export function envelope(
  source: Generator<number>,
  attackTime: number,
  decayTime: number,
  sustainLevel: number,
  releaseTime: number,
  gateTime?: number
): Generator<number>;
