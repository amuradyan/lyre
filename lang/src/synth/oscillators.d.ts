/**
 * Audio sampling rate in Hz
 */
export const samplingRate: number;

/**
 * Generates an infinite sine wave at the given frequency.
 */
export function oscillate(frequency: number): Generator<number>;

/**
 * Generates an infinite sine wave tone at the given frequency.
 */
export function tone(frequency: number): Generator<number>;

/**
 * Generates an infinite sawtooth wave at the given frequency.
 */
export function sawtooth(frequency: number): Generator<number>;
