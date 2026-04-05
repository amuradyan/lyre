import { raw, wrap } from '../synth/oscillators.js';
import { envelope, gain } from '../synth/envelopes.js';
import { sequence, harmony, mix } from '../synth/composition.js';
import { lowpass, highpass } from '../synth/filters.js';
import { arithmetic } from '../synth/math.js';

/**
 * Built-in note name to frequency mappings.
 * Contains musical notes from C1 to G6 with both sharp and flat notations.
 * Each entry is a [name, frequency] pair for use with lookup().
 * @type {Array<[string, number]>}
 * @example
 * prelude.find(([name]) => name === "A4") // ["A4", 440.00]
 */
export const prelude = [
  ["C1", 32.70],
  ["C#1", 34.65],
  ["D1", 36.71],
  ["D#1", 38.89],
  ["E1", 41.20],
  ["F1", 43.65],
  ["F#1", 46.25],
  ["G1", 49.00],
  ["G#1", 51.91],
  ["A1", 55.00],
  ["A#1", 58.27],
  ["B1", 61.74],
  ["C2", 65.41],
  ["C#2", 69.30],
  ["D2", 73.42],
  ["D#2", 77.78],
  ["E2", 82.41],
  ["F2", 87.31],
  ["F#2", 92.50],
  ["G2", 98.00],
  ["G#2", 103.83],
  ["A2", 110.00],
  ["A#2", 116.54],
  ["B2", 123.47],
  ["C3", 130.81],
  ["C#3", 138.59],
  ["D3", 146.83],
  ["D#3", 155.56],
  ["E3", 164.81],
  ["F3", 174.61],
  ["F#3", 185.00],
  ["G3", 196.00],
  ["G#3", 207.65],
  ["A3", 220.00],
  ["A#3", 233.08],
  ["B3", 246.94],
  ["C4", 261.63],
  ["C#4", 277.18],
  ["D4", 293.66],
  ["D#4", 311.13],
  ["E4", 329.63],
  ["F4", 349.23],
  ["F#4", 369.99],
  ["G4", 392.00],
  ["G#4", 415.30],
  ["A4", 440.00],
  ["A#4", 466.16],
  ["B4", 493.88],
  ["C5", 523.25],
  ["C#5", 554.37],
  ["D5", 587.33],
  ["D#5", 622.25],
  ["E5", 659.25],
  ["F5", 698.46],
  ["F#5", 739.99],
  ["G5", 783.99],
  ["G#5", 830.61],
  ["A5", 880.00],
  ["A#5", 932.33],
  ["B5", 987.77],
  ["C6", 1046.50],
  ["C#6", 1108.73],
  ["D6", 1174.66],
  ["D#6", 1244.51],
  ["E6", 1318.51],
  ["F6", 1396.91],
  ["F#6", 1479.98],
  ["G6", 1567.98],
  ["Db1", 34.65],
  ["Eb1", 38.89],
  ["Gb1", 46.25],
  ["Ab1", 51.91],
  ["Bb1", 58.27],
  ["Db2", 69.30],
  ["Eb2", 77.78],
  ["Gb2", 92.50],
  ["Ab2", 103.83],
  ["Bb2", 116.54],
  ["Db3", 138.59],
  ["Eb3", 155.56],
  ["Gb3", 185.00],
  ["Ab3", 207.65],
  ["Bb3", 233.08],
  ["Db4", 277.18],
  ["Eb4", 311.13],
  ["Gb4", 369.99],
  ["Ab4", 415.30],
  ["Bb4", 466.16],
  ["Db5", 554.37],
  ["Eb5", 622.25],
  ["Gb5", 739.99],
  ["Ab5", 830.61],
  ["Bb5", 932.33],
  ["Db6", 1108.73],
  ["Eb6", 1244.51],
  ["Gb6", 1479.98],
  ["Ab6", 1661.22],
  ["Bb6", 1864.66],
  [".", 0.5],
  ["attack", 0.005],
  ["decay", 0],
  ["sustain", 1],
  ["release", 0.005],
  ["sine", (args) => wrap(raw.sine, args[0])],
  ["sawtooth", (args) => wrap(raw.sawtooth, args[0])],
  ["square", (args) => wrap(raw.square, args[0])],
  ["triangle", (args) => wrap(raw.triangle, args[0])],
  ["wave", (args) => wrap(raw.sine, args[0])],
  ["flat", (args) => wrap(raw.dc, args[0])],
  ["lowpass", (args) => {
    const [cutoff, ...sources] = args;
    if (sources.length === 1) return lowpass(sources[0], cutoff);
    return sequence(...sources.map(s => lowpass(s, cutoff)));
  }],
  ["highpass", (args) => {
    const [cutoff, ...sources] = args;
    if (sources.length === 1) return highpass(sources[0], cutoff);
    return sequence(...sources.map(s => highpass(s, cutoff)));
  }],
  ["+", (args) => arithmetic(args, (a, b) => a + b)],
  ["-", (args) => arithmetic(args, (a, b) => a - b)],
  ["*", (args) => arithmetic(args, (a, b) => a * b)],
  ["/", (args) => arithmetic(args, (a, b) => a / b)],
  ["sequence", (args) => sequence(...args)],
  ["harmony", (args) => harmony(...args)],
  ["mix", (args) => mix(...args)],
  ["gain", (args) => gain(args[0], args[1])],
  ["envelope", (args) => {
    const [attackTime, decayTime, sustainLevel, releaseTime, gateTime, ...sources] = args;
    const enveloped =
      sources.map(source =>
        envelope(source, attackTime, decayTime, sustainLevel, releaseTime, gateTime));
    return sequence(...enveloped);
  }],
  ["play", (args, env) => {
    const [ticks, freq] = args;
    const waveFn = lookup('wave', env);
    const gateTime = ticks * lookup('.', env);
    const a = lookup('attack', env);
    const d = lookup('decay', env);
    const s = lookup('sustain', env);
    const r = lookup('release', env);
    return envelope(waveFn([freq], env), a, d, s, r, gateTime);
  }],
];

/**
 * Looks up a name in the environment, falling back to prelude.
 * @param {string} key - The name to look up (e.g., "C4", "A4")
 * @param {Array<[string, any]>} env - Optional custom environment bindings (searched first)
 * @returns {any} The value associated with the key
 * @throws {Error} If the key is not found in either env or prelude
 * @example
 * lookup("A4") // 440.00
 * lookup("C4", [["C4", 300]]) // 300 (custom env overrides prelude)
 */
export function lookup(key, env = []) {
  const combined = [...prelude, ...env];
  for (let i = combined.length - 1; i >= 0; i--) {
    if (combined[i][0] === key) {
      return combined[i][1];
    }
  }
  throw new Error(`Unknown name: ${key}`);
}
