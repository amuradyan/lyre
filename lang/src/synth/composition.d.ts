/**
 * Plays generators sequentially, one after another.
 */
export function sequence(...generators: Generator<number>[]): Generator<number>;

/**
 * Mixes generators in parallel by summing their samples.
 */
export function harmony(...generators: Generator<number>[]): Generator<number>;

/**
 * Repeats a generator function N times.
 */
export function repeat(times: number, generatorFunc: () => Generator<number>): Generator<number>;
