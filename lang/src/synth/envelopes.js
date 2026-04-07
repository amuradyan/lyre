const getSampleRate = () => globalThis.SAMPLE_RATE || 48000;

/**
 * Calculates the amplitude multiplier for a given sample position in an ADSR envelope.
 * @param {number} n - Current sample position
 * @param {number} totalSamples - Total number of samples in the envelope
 * @param {number[]} adsr - Array of [attackTime, decayTime, sustainLevel, releaseTime]
 * @returns {number} Amplitude multiplier (0-1)
 */
export function adjustAmplitude(n, totalSamples, adsr) {
  const [attackTime, decayTime, sustainLevel, releaseTime] = adsr;
  const samplingRate = getSampleRate();
  const attackSamples = attackTime * samplingRate;
  const releaseSamples = releaseTime * samplingRate;
  const decaySamples = decayTime * samplingRate;

  if (n < attackSamples) {
    return (n + 1) / attackSamples;
  } else if (n < attackSamples + decaySamples) {
    const decayProgress = (n - attackSamples) / decaySamples;
    return 1 - (1 - sustainLevel) * decayProgress;
  } else if (n >= totalSamples - releaseSamples) {
    const releaseProgress = (totalSamples - n - 1) / releaseSamples;
    return sustainLevel * releaseProgress;
  } else {
    return sustainLevel;
  }
}

/**
 * Applies an ADSR envelope to shape the amplitude of a source generator.
 * Reads totalSamples from the source's tuples - use gate() to set duration.
 * For infinite sources, the release phase never fires (sustain holds forever).
 * @param {Generator} source - Source audio generator yielding [sample, n, totalSamples]
 * @param {number} attackTime - Attack time in seconds (ramp up from silence)
 * @param {number} decayTime - Decay time in seconds (fall to sustain level)
 * @param {number} sustainLevel - Sustain level (0-1, amplitude during hold)
 * @param {number} releaseTime - Release time in seconds (fade to silence)
 * @yields {Array} Shaped tuples of [sample, n, totalSamples]
 * @example
 * const pluck = envelope(gate(1.5, wrap(raw.sine, 261.63)), 0.01, 1.0, 0, 0.5);
 * // 1.5s plucked C4 with quick attack and 500ms release
 */
export function* envelope(source, attackTime, decayTime, sustainLevel, releaseTime) {
  const adsr = [attackTime, decayTime, sustainLevel, releaseTime];
  for (const [sample, n, totalSamples] of source) {
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield [sample * amplitude, n, totalSamples];
  }
}

/**
 * Adjusts the volume of a source generator by a given level.
 * @param {Generator} source - Source audio generator
 * @param {number} level - Gain level (0-1)
 * @yields {Array} Tuples of [sample, n, totalSamples] with sample scaled by level
 * @example
 * const quietTone = gain(tone(440), 0.5); // Half volume tone at 440Hz
 */
export function* gain(source, level) {
  for (const [sample, n, totalSamples] of source) {
    yield [sample * level, n, totalSamples];
  }
}

/**
 * Time-boxes a source by yielding samples for a fixed duration, then stopping.
 * Rewrites totalSamples in output tuples to match the gate duration.
 * @param {number} duration - Duration in seconds
 * @param {Generator} source - Source audio generator yielding [sample, n, totalSamples]
 * @yields {Array} Tuples of [sample, n, totalSamples] where totalSamples reflects gate duration
 * @example
 * gate(1.5, wrap(raw.sine, 440)) // 1.5 seconds of A4 at full amplitude
 */
export function* gate(duration, source) {
  const samplingRate = getSampleRate();
  const totalSamples = duration * samplingRate;
  let n = 0;
  for (const [sample] of source) {
    if (n >= totalSamples) return;
    yield [sample, n, totalSamples];
    n = n + 1;
  }
}
