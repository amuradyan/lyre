import { samplingRate } from './oscillators.js';

/**
 * Calculates the amplitude multiplier for a given sample position in an ADSR envelope.
 * @param {number} n - Current sample position
 * @param {number} totalSamples - Total number of samples in the envelope
 * @param {number[]} adsr - Array of [attackTime, decayTime, sustainLevel, releaseTime]
 * @returns {number} Amplitude multiplier (0-1)
 */
export function adjustAmplitude(n, totalSamples, adsr) {
  const [attackTime, decayTime, sustainLevel, releaseTime] = adsr;
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
 * @param {Generator} source - Source audio generator
 * @param {number} attackTime - Attack time in seconds (ramp up from silence)
 * @param {number} decayTime - Decay time in seconds (fall to sustain level)
 * @param {number} sustainLevel - Sustain level (0-1, amplitude during hold)
 * @param {number} releaseTime - Release time in seconds (fade to silence)
 * @param {number} [gateTime=0] - Gate time in seconds (hold at sustain level)
 * @yields {number} Shaped audio samples between -1 and 1
 * @example
 * const pluck = envelope(tone(261.63), 0.01, 1.0, 0, 0.5);
 * // Quick attack, 1s decay, no sustain, 500ms release
 */
export function*
  envelope(source, attackTime, decayTime, sustainLevel, releaseTime, gateTime = 0) {
  const totalTime = attackTime + decayTime + gateTime + releaseTime;
  const totalSamples = totalTime * samplingRate;
  const adsr = [attackTime, decayTime, sustainLevel, releaseTime];

  let n = 0;
  for (const [sample] of source) {
    if (n >= totalSamples) {
      return;
    }
    const amplitude = adjustAmplitude(n, totalSamples, adsr);
    yield [sample * amplitude, n, totalSamples];
    n = n + 1;
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
