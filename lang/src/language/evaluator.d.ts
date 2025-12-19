/**
 * Interprets a tokenized Lyre expression and returns a generator function.
 */
export function interpret(expression: string | any[]): Generator<number> | number;
