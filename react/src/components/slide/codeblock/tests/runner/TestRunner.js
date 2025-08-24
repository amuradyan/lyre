/**
 * Test runner for markdown code blocks with inline test comments
 * Format: <!-- "value" --> or <!-- {2:"a"} -->
 */

/**
 * Safely evaluate JavaScript code and return the result
 * @param {string} code - JavaScript code to evaluate
 * @returns {Object} - {success: boolean, result: any, error: string|null}
 */
export function evaluateCode(code) {
  try {
    let result = eval(code);

    if (result === undefined) {
      const functionMatch = code.match(/function\s+(\w+)\s*\(/);

      if (functionMatch) {
        const functionName = functionMatch[1];

        try {
          result = eval(functionName);
        } catch (e) {
          const modifiedCode = `${code}\nreturn ${functionName};`;
          result = eval(`(function() { ${modifiedCode} })()`);
        }
      }
    }

    return {
      success: true,
      result: result,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      result: null,
      error: error.message
    };
  }
}

/**
 * Parse test value from HTML comment
 * <!-- "beep!" --> becomes "beep!" (for value tests)
 * <!-- [{"input": [1,2,3], "expected": 3}] --> becomes array format (for function tests)
 * @param {string} comment - HTML comment string
 * @returns {any|null} - Parsed JSON value or null if invalid
 */
export function parseTestComment(comment) {
  if (!comment) return null;

  try {
    const content = comment
      .replace(/<!--\s*/, '')
      .replace(/\s*-->/, '')
      .trim();

    if (!content) return null;

    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.warn('Failed to parse test comment:', comment, error);
    return null;
  }
}

/**
 * Deep equality check for comparing values including arrays and objects
 */
function deepEqual(a, b) {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return false;
}

/**
 * Run tests based on the evaluation result and test specification
 * @param {Object} evaluationResult - Result from evaluateCode
 * @param {any} testSpec - Expected value object {"expected": value} or array of test cases (for functions)
 * @returns {Object} - Test results with success/failure details
 */
export function runMarkdownTest(evaluationResult, testSpec) {
  const { result } = evaluationResult;

  if (testSpec === null || testSpec === undefined) {
    return {
      success: true,
      message: 'No test specified',
      results: []
    };
  }

  if (!evaluationResult.success) {
    if (Array.isArray(testSpec)) {
      const results = testSpec.map(testCase => ({
        input: testCase.input,
        expected: testCase.expected,
        actual: '?',
        passed: false
      }));

      return {
        success: false,
        type: 'function',
        results
      };
    }
    else if (typeof testSpec === 'object' && testSpec !== null && testSpec.hasOwnProperty('expected')) {
      return {
        success: false,
        type: 'value',
        results: [{
          expected: testSpec.expected,
          actual: '?',
          passed: false
        }]
      };
    } else {
      return {
        success: false,
        type: 'value',
        results: [{
          expected: testSpec,
          actual: '?',
          passed: false
        }]
      };
    }
  }

  if (typeof result === 'function') {
    if (typeof testSpec === 'object' && testSpec !== null && testSpec.hasOwnProperty('expected') && !Array.isArray(testSpec)) {
      try {
        const actual = result();
        const passed = deepEqual(actual, testSpec.expected);

        return {
          success: passed,
          type: 'function',
          results: [{
            input: undefined,
            expected: testSpec.expected,
            actual,
            passed
          }]
        };
      } catch (error) {
        return {
          success: false,
          type: 'function',
          results: [{
            input: undefined,
            expected: testSpec.expected,
            actual: null,
            passed: false,
            error: error.message
          }]
        };
      }
    }

    if (Array.isArray(testSpec)) {
      const results = [];
      let allPassed = true;

      for (const testCase of testSpec) {
        if (!testCase.hasOwnProperty('input') || !testCase.hasOwnProperty('expected')) {
          results.push({
            input: testCase.input || 'undefined',
            expected: testCase.expected || 'undefined',
            actual: null,
            passed: false,
            error: 'Test case must have "input" and "expected" properties'
          });
          allPassed = false;
          continue;
        }

        try {
          const actual = result(testCase.input);
          const passed = deepEqual(actual, testCase.expected);

          results.push({
            input: testCase.input,
            expected: testCase.expected,
            actual,
            passed
          });

          if (!passed) allPassed = false;
        } catch (error) {
          results.push({
            input: testCase.input,
            expected: testCase.expected,
            actual: null,
            passed: false,
            error: error.message
          });
          allPassed = false;
        }
      }

      return {
        success: allPassed,
        type: 'function',
        results
      };
    } else {
      return {
        success: false,
        error: 'Function tests require either an array of test cases with {input, expected} format or a simple {expected} format for parameterless functions',
        results: []
      };
    }
  } else {
    let expectedValue;

    if (typeof testSpec === 'object' && testSpec !== null && testSpec.hasOwnProperty('expected')) {
      expectedValue = testSpec.expected;
    } else {
      expectedValue = testSpec;
    }

    const passed = deepEqual(result, expectedValue);

    return {
      success: passed,
      type: 'value',
      results: [{
        expected: expectedValue,
        actual: result,
        passed
      }]
    };
  }
}

/**
 * Complete test execution pipeline
 * @param {string} code - JavaScript code to evaluate
 * @param {string} testComment - HTML comment with test specification
 * @returns {Object} - Complete test results
 */
export function executeMarkdownTest(code, testComment) {
  const evaluationResult = evaluateCode(code);
  const testSpec = parseTestComment(testComment);
  return runMarkdownTest(evaluationResult, testSpec);
}
