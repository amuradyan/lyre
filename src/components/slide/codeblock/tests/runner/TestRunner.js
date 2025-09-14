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
  return content ? safeJsonParse(content) : null;
};

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

  if (Array.isArray(a) && Array.isArray(b)) {
    return areArraysEqual(a, b);
  }

  if (typeof a === 'object' && typeof b === 'object') {
    return areObjectsEqual(a, b);
  }

  return false;
};

const createTestResult = (success, type = 'value', results = [], error = null, message = null) => ({
  success,
  type,
  results,
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
    const results = testSpec.map(testCase =>
      createFailedResult(testCase.input, testCase.expected)
    );
    return createTestResult(false, 'function', results);
  }

  const isObjectWithExpected = typeof testSpec === 'object' &&
    testSpec !== null &&
    testSpec.hasOwnProperty('expected');

  const expected = isObjectWithExpected ? testSpec.expected : testSpec;
  const results = [createFailedResult(undefined, expected)];

  return createTestResult(false, 'value', results);
};

const executeParameterlessFunction = (fn, testSpec) => {
  try {
    const actual = fn();
    const result = createPassedResult(undefined, testSpec.expected, actual);
    return createTestResult(result.passed, 'function', [result]);
  } catch (error) {
    const result = {
      input: undefined,
      expected: testSpec.expected,
      actual: null,
      passed: false,
      error: error.message
    };
    return createTestResult(false, 'function', [result]);
  }
};

const executeTestCase = (fn, testCase) => {
  const hasRequiredProperties = testCase.hasOwnProperty('input') &&
    testCase.hasOwnProperty('expected');

  if (!hasRequiredProperties) {
    return createFailedResult(
      testCase.input || 'undefined',
      testCase.expected || 'undefined',
      'Test case must have "input" and "expected" properties'
    );
  }

  try {
    const actual = fn(testCase.input);
    return createPassedResult(testCase.input, testCase.expected, actual);
  } catch (error) {
    return {
      input: testCase.input,
      expected: testCase.expected,
      actual: null,
      passed: false,
      error: error.message
    };
  }
};

const executeFunctionTests = (fn, testSpec) => {
  const isParameterlessTest = typeof testSpec === 'object' &&
    testSpec !== null &&
    testSpec.hasOwnProperty('expected') &&
    !Array.isArray(testSpec);

  if (isParameterlessTest) {
    return executeParameterlessFunction(fn, testSpec);
  }

  if (Array.isArray(testSpec)) {
    const results = testSpec.map(testCase => executeTestCase(fn, testCase));
    const allPassed = results.every(result => result.passed);
    return createTestResult(allPassed, 'function', results);
  }

  return createTestResult(
    false,
    'function',
    [],
    'Function tests require either an array of test cases with {input, expected} format or a simple {expected} format for parameterless functions'
  );
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

export const runMarkdownTest = (evaluationResult, testSpec) => {
  if (testSpec === null || testSpec === undefined) {
    return handleNoTestSpec();
  }

  if (!evaluationResult.success) {
    return handleFailedEvaluation(testSpec);
  }

  const { result } = evaluationResult;

  return typeof result === 'function'
    ? executeFunctionTests(result, testSpec)
    : executeValueTest(result, testSpec);
};

export const executeMarkdownTest = (code, testComment) => {
  const evaluationResult = evaluateCode(code);
  const testSpec = parseTestComment(testComment);
  return runMarkdownTest(evaluationResult, testSpec);
};
