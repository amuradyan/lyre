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
    // Split code into lines and find the last executable line
    const lines = code.trim().split('\n').map(line => line.trim()).filter(line => line);
    const lastLine = lines[lines.length - 1];

    // Check if the last line is an expression (not a declaration)
    const isExpression = lastLine &&
      !lastLine.startsWith('function ') &&
      !lastLine.startsWith('const ') &&
      !lastLine.startsWith('let ') &&
      !lastLine.startsWith('var ') &&
      !lastLine.startsWith('//') &&
      !lastLine.startsWith('/*') &&
      !lastLine.includes('=') && // Not an assignment
      lastLine.length > 0;

    let result;
    if (isExpression) {
      // More robust approach: execute all code, then evaluate the last line separately
      const codeWithoutLastLine = lines.slice(0, -1).join('\n');
      const func = new Function(`
        ${codeWithoutLastLine}
        return ${lastLine};
      `);
      result = func();
    } else {
      // If last line is a declaration or assignment, just execute and return undefined
      const func = new Function(code);
      result = func();
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
 * <!-- "beep!" --> becomes "beep!"
 * <!-- {2:"a"} --> becomes {2:"a"}
 * @param {string} comment - HTML comment string
 * @returns {any|null} - Parsed JSON value or null if invalid
 */
export function parseTestComment(comment) {
  if (!comment) return null;

  try {
    // Remove HTML comment markers and trim
    const content = comment
      .replace(/<!--\s*/, '')
      .replace(/\s*-->/, '')
      .trim();

    if (!content) return null;

    // Parse as JSON
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to parse test comment:', comment, error);
    return null;
  }
}

/**
 * Run tests based on the evaluation result and test specification
 * @param {Object} evaluationResult - Result from evaluateCode
 * @param {any} testSpec - Expected value or test object from comment
 * @returns {Object} - Test results with success/failure details
 */
export function runMarkdownTest(evaluationResult, testSpec) {
  if (!evaluationResult.success) {
    return {
      success: false,
      error: `Code evaluation failed: ${evaluationResult.error}`,
      results: []
    };
  }

  const { result } = evaluationResult;

  if (testSpec === null || testSpec === undefined) {
    return {
      success: true,
      message: 'No test specified',
      results: []
    };
  }

  // Check if the result is a function
  if (typeof result === 'function') {
    // Test spec should be an object with input->expected mappings
    if (typeof testSpec !== 'object' || testSpec === null || Array.isArray(testSpec)) {
      return {
        success: false,
        error: 'Function tests require an object with input->expected mappings',
        results: []
      };
    }

    const results = [];
    let allPassed = true;

    for (const [input, expected] of Object.entries(testSpec)) {
      try {
        // Convert input to appropriate type (try parsing as number first)
        let parsedInput = input;
        const numInput = Number(input);
        if (!isNaN(numInput) && isFinite(numInput) && numInput.toString() === input) {
          parsedInput = numInput;
        }

        const actual = result(parsedInput);
        const passed = actual === expected;

        results.push({
          input: parsedInput,
          expected,
          actual,
          passed
        });

        if (!passed) allPassed = false;
      } catch (error) {
        results.push({
          input: parsedInput,
          expected,
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
    // Direct value comparison
    const passed = result === testSpec;

    return {
      success: passed,
      type: 'value',
      results: [{
        expected: testSpec,
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
