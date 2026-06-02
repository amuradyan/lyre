import { lookup } from './environment.js';

const isClosure = (x) => x && typeof x === 'object' && x.kind === 'closure';

function evalSymbol(s, env) {
  const num = parseFloat(s);
  if (!isNaN(num)) return num;
  return lookup(s, env);
}

function evalLet(operands, env) {
  if (operands.length !== 2) {
    throw new Error(`let expects exactly one body expression; got ${operands.length - 1}`);
  }
  const [bindings, body] = operands;
  const newEnv = [...env];
  for (let i = 0; i < bindings.length; i += 2) {
    newEnv.push([bindings[i], evaluate(bindings[i + 1], newEnv)]);
  }
  return evaluate(body, newEnv);
}

function evalPatch(operands, env) {
  if (!Array.isArray(operands[0])) {
    throw new Error("patch expects an args list as first operand");
  }
  if (operands.length !== 2) {
    throw new Error(`patch expects exactly one body expression; got ${operands.length - 1}`);
  }
  const args = operands[0];
  for (const arg of args) {
    if (typeof arg !== 'string') {
      throw new Error(`patch args must be symbols; got ${JSON.stringify(arg)}`);
    }
  }
  return { kind: 'closure', args, body: operands[1], env: [...env] };
}

function apply(operator, operands, env) {
  const callable = evaluate(operator, env);
  const args = operands.map(o => evaluate(o, env));

  if (typeof callable === 'function') {
    return callable(args, env);
  }

  if (isClosure(callable)) {
    if (args.length !== callable.args.length) {
      throw new Error(`Arity mismatch: patch expects ${callable.args.length} arg(s), got ${args.length}`);
    }
    const extendedEnv = [...callable.env];
    for (let i = 0; i < callable.args.length; i++) {
      extendedEnv.push([callable.args[i], args[i]]);
    }
    return evaluate(callable.body, extendedEnv);
  }

  throw new Error(`Unknown operator: ${operator}`);
}

/**
 * Interprets a tokenized Lyre expression and returns a generator, number, or closure value.
 * @param {string|Array} expression - A tokenized expression (from tokenize) or a string number
 * @param {Array} env - Environment bindings (list of [name, value] pairs)
 * @returns {Generator|number|object} A generator yielding samples, a number, or a closure value
 */
export function evaluate(expression, env = []) {
  if (typeof expression === 'string') return evalSymbol(expression, env);

  const [operator, ...operands] = expression;
  switch (operator) {
    case 'let':   return evalLet(operands, env);
    case 'patch': return evalPatch(operands, env);
    default:      return apply(operator, operands, env);
  }
}
