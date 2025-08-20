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
    // Create a safe evaluation context
    const func = new Function(`
      ${code}

      // Try to detect and return functions first
      const lines = ${JSON.stringify(code)}.trim().split('\\n').filter(line => line.trim());

      // Look for function declarations
      const funcMatch = ${JSON.stringify(code)}.match(/function\\s+(\\w+)/);
      if (funcMatch) {
        return eval(funcMatch[1]);
      }

      // Look for arrow function assignments
      const arrowMatch = ${JSON.stringify(code)}.match(/(?:const|let|var)\\s+(\\w+)\\s*=/);
      if (arrowMatch) {
        try {
          return eval(arrowMatch[1]);
        } catch (e) {
          // Fall through to expression evaluation
        }
      }

      // Try to evaluate the last line as an expression
      const lastLine = lines[lines.length - 1].trim();
      if (lastLine && !lastLine.startsWith('//') && !lastLine.startsWith('/*') &&
          !lastLine.includes('function ') && !lastLine.includes('const ') &&
          !lastLine.includes('let ') && !lastLine.includes('var ')) {
        try {
          return eval(lastLine);
        } catch (e) {
          // Fall through
        }
      }

      return undefined;
    `);

    const result = func();
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
