const tests = [
  { n: 0, expected: 1 },
  { n: 1, expected: 1 },
  { n: 3, expected: 6 },
  { n: 5, expected: 120 },
  { n: 7, expected: 5040 },
  { n: 10, expected: 3628800 }
];

const buildFactorial = (userCode) => {
  try {
    return new Function(`return (${userCode})`)();
  } catch (e) {
    throw new Error('Invalid user code');
  }
};

export const executeTests = (userCode) => {
  let func;
  try {
    func = buildFactorial(userCode);
  } catch (e) {
    console.error('Build error:', e);
    return tests.map(t => ({ n: t.n, value: NaN, expected: t.expected, passed: false, error: 'Build failed: ' + e.message }));
  }
  if (typeof func !== 'function') {
    return tests.map(t => ({ n: t.n, value: NaN, expected: t.expected, passed: false, error: 'factorial not defined' }));
  }

  return tests.map(t => {
    try {
      const value = func(t.n);
      if (typeof value !== 'number') {
        return { n: t.n, value: NaN, expected: t.expected, passed: false, error: `Returned ${value === undefined ? 'undefined' : typeof value}` };
      }
      if (Number.isNaN(value)) {
        return { n: t.n, value: NaN, expected: t.expected, passed: false, error: 'Returned NaN' };
      }
      return { n: t.n, value, expected: t.expected, passed: value === t.expected };
    } catch (e) {
      return { n: t.n, value: NaN, expected: t.expected, passed: false, error: e.message };
    }
  });
};
