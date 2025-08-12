const tests = [
  { n: 0, expected: 1 },
  { n: 1, expected: 1 },
  { n: 3, expected: 6 },
  { n: 5, expected: 120 },
  { n: 7, expected: 5040 },
  { n: 10, expected: 3628800 }
];

export const executeTests = (userCode) => {
  try {
    const func = new Function(`${userCode}; return factorial;`)();
    return tests.map(test => {
      const value = func(test.n);
      return { n: test.n, value, expected: test.expected, passed: value === test.expected };
    });
  } catch (error) {
    console.error('Test execution error:', error);
    return tests.map(test => ({ n: test.n, value: NaN, expected: test.expected, passed: false }));
  }
};
