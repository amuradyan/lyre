const isGen = (x) => typeof x?.next === 'function';

/**
 * Sample-by-sample arithmetic on numbers or generators.
 * When both operands are numbers, returns a number.
 * When either is a generator, returns a generator yielding tupled results.
 * @param {Array} args - [a, b] where each can be a number or generator
 * @param {Function} op - Binary operation (a, b) => result
 * @returns {number|Generator}
 */
export function arithmetic(args, op) {
  const [a, b] = args;
  if (!isGen(a) && !isGen(b)) return op(a, b);
  return arithmeticGen(a, b, op);
}

function* arithmeticGen(a, b, op) {
  const aGen = isGen(a);
  const bGen = isGen(b);
  let n = 0;

  while (true) {
    const aNext = aGen ? a.next() : null;
    const bNext = bGen ? b.next() : null;

    if ((aGen && aNext.done) || (bGen && bNext.done)) return;

    const aVal = aGen ? aNext.value[0] : a;
    const bVal = bGen ? bNext.value[0] : b;
    const aTotal = aGen ? aNext.value[2] : Infinity;
    const bTotal = bGen ? bNext.value[2] : Infinity;

    yield [op(aVal, bVal), n, Math.max(aTotal, bTotal)];
    n = n + 1;
  }
}
