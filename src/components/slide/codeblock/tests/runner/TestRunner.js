const FLOAT_TOLERANCE = 1e-10;

const createResult = (success, result = null, error = null) => ({ success, result, error });

const extractFunctionName = (code) => {
  const match = code.match(/function\s+(\w+)\s*\(/);
  return match ? match[1] : null;
};

const tryEvaluate = (code) => {
  try {
    return { success: true, result: eval(code) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const evaluateFunctionByName = (functionName) =>
  tryEvaluate(functionName);

const evaluateFunctionWithReturn = (code, functionName) =>
  tryEvaluate(`(function() { ${code}\nreturn ${functionName}; })()`);

const handleUndefinedResult = (code) => {
  const functionName = extractFunctionName(code);
  if (!functionName) return createResult(true, undefined);

  const directEval = evaluateFunctionByName(functionName);
  return directEval.success
    ? createResult(true, directEval.result)
    : (() => {
      const withReturn = evaluateFunctionWithReturn(code, functionName);
      return withReturn.success
        ? createResult(true, withReturn.result)
        : createResult(false, null, withReturn.error);
    })();
};

export const evaluateCode = (code) => {
  const initialEval = tryEvaluate(code);

  if (!initialEval.success) {
    return createResult(false, null, initialEval.error);
  }

  return initialEval.result === undefined
    ? handleUndefinedResult(code)
    : createResult(true, initialEval.result);
};

const cleanCommentContent = (comment) =>
  comment
    .replace(/<!--\s*/, '')
    .replace(/\s*-->/, '')
    .trim();

const safeJsonParse = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to parse test comment:', content, error);
    return null;
  }
};

export const parseTestComment = (comment) => {
  if (!comment) return null;

  const content = cleanCommentContent(comment);
  const parsed = content ? safeJsonParse(content) : null;

  if (!parsed) return null;

  if (parsed.tests && Array.isArray(parsed.tests)) {
    return {
      testSpec: parsed.tests,
      layout: parsed.layout || 'grid'
    };
  }

  return {
    testSpec: parsed,
    layout: 'grid'
  };
};

const areNumbersApproximatelyEqual = (a, b) =>
  Math.abs(a - b) < FLOAT_TOLERANCE;

const areArraysEqual = (a, b) =>
  a.length === b.length && a.every((item, index) => deepEqual(item, b[index]));

const areObjectsEqual = (a, b) => {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  return keysA.length === keysB.length &&
    keysA.every(key => keysB.includes(key) && deepEqual(a[key], b[key]));
};

const deepEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'number' && typeof b === 'number') {
    return areNumbersApproximatelyEqual(a, b);
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    return areArraysEqual(a, b);
  }

  if (typeof a === 'object' && typeof b === 'object') {
    return areObjectsEqual(a, b);
  }

  return false;
};

const createTestResult = (success, type = 'value', results = [], error = null, message = null, layout = 'grid') => ({
  success,
  type,
  results,
  layout,
  ...(error && { error }),
  ...(message && { message })
});

const createFailedResult = (input, expected, error = null) => ({
  input,
  expected,
  actual: '?',
  passed: false,
  ...(error && { error })
});

const createPassedResult = (input, expected, actual) => ({
  input,
  expected,
  actual,
  passed: deepEqual(actual, expected)
});

const handleNoTestSpec = () =>
  createTestResult(true, 'value', [], null, 'No test specified');

const handleFailedEvaluation = (testSpec) => {
  if (Array.isArray(testSpec)) {
    const results = testSpec.map(testCase => {
      const input = testCase.hasOwnProperty('inputs') ? testCase.inputs : undefined;
      return createFailedResult(input, testCase.expected);
    });
    return createTestResult(false, 'function', results);
  }

  const results = [createFailedResult(undefined, testSpec)];
  return createTestResult(false, 'value', results);
};

const executeTestCase = (fn, testCase) => {
  if (!testCase.hasOwnProperty('expected')) {
    return createFailedResult(
      'undefined',
      testCase.expected || 'undefined',
      'Test case must have "expected" property'
    );
  }

  if (!testCase.hasOwnProperty('inputs')) {
    return createFailedResult(
      'undefined',
      testCase.expected,
      'Test case must have "inputs" array'
    );
  }

  if (!Array.isArray(testCase.inputs)) {
    return createFailedResult(
      testCase.inputs,
      testCase.expected,
      '"inputs" must be an array'
    );
  }

  const inputs = testCase.inputs;
  const inputsCopy = JSON.parse(JSON.stringify(inputs));

  try {
    const actual = fn(...inputs);
    return createPassedResult(inputsCopy, testCase.expected, actual);
  } catch (error) {
    return {
      input: inputsCopy,
      expected: testCase.expected,
      actual: null,
      passed: false,
      error: error.message
    };
  }
};

const executeFunctionTests = (fn, testSpec) => {
  if (!Array.isArray(testSpec)) {
    return createTestResult(
      false,
      'function',
      [],
      'Test spec must be an array of test cases with {inputs: [...], expected: ...} format'
    );
  }

  const results = testSpec.map(testCase => executeTestCase(fn, testCase));
  const allPassed = results.every(result => result.passed);
  return createTestResult(allPassed, 'function', results);
};

const executeValueTest = (result, testSpec) => {
  const expectedValue = typeof testSpec === 'object' &&
    testSpec !== null &&
    testSpec.hasOwnProperty('expected')
    ? testSpec.expected
    : testSpec;

  const passed = deepEqual(result, expectedValue);
  const testResult = {
    expected: expectedValue,
    actual: result,
    passed
  };

  return createTestResult(passed, 'value', [testResult]);
};

export const runMarkdownTest = (evaluationResult, testSpec, layout = 'grid') => {
  if (testSpec === null || testSpec === undefined) {
    return handleNoTestSpec();
  }

  if (!evaluationResult.success) {
    const result = handleFailedEvaluation(testSpec);
    return { ...result, layout };
  }

  const { result } = evaluationResult;

  const testResult = typeof result === 'function'
    ? executeFunctionTests(result, testSpec)
    : executeValueTest(result, testSpec);

  return { ...testResult, layout };
};

export const executeMarkdownTest = (code, testComment) => {
  const evaluationResult = evaluateCode(code);
  const parsed = parseTestComment(testComment);

  if (!parsed) {
    return runMarkdownTest(evaluationResult, null);
  }

  return runMarkdownTest(evaluationResult, parsed.testSpec, parsed.layout);
};
