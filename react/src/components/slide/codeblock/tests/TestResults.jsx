import TestCase from './TestCase.jsx';

export default function TestResults({ testCases, testResult }) {
  // Handle MarkdownTestRunner format (testResult prop)
  if (testResult) {
    if (!testResult) {
      return null;
    }

    // Handle evaluation errors
    if (!testResult.success && testResult.error) {
      const errorTestCase = {
        message: `Test Error: ${testResult.error}`,
        passed: false,
        error: testResult.error,
        color: '#f85149'
      };
      const cases = [errorTestCase];
      const columnCount = Math.min(cases.length, 3);

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: '12px',
          marginTop: '24px'
        }}>
          {cases.map((testCase, i) => (
            <TestCase key={i} {...testCase} />
          ))}
        </div>
      );
    }

    // Handle "no test" case
    if (testResult.message) {
      const noTestCase = {
        message: testResult.message,
        passed: true,
        color: '#6e7681'
      };
      const cases = [noTestCase];
      const columnCount = Math.min(cases.length, 3);

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          gap: '12px',
          marginTop: '24px'
        }}>
          {cases.map((testCase, i) => (
            <TestCase key={i} {...testCase} />
          ))}
        </div>
      );
    }

    const { results, type } = testResult;

    // Convert MarkdownTestRunner results to TestCase format
    const convertedTestCases = results.map((result) => {
      const { input, expected, actual, passed, error } = result;

      return {
        input: type === 'function' ? input : undefined,
        expected,
        actual,
        passed,
        error,
        color: error ? '#f85149' : (passed ? '#2ea043' : '#f85149')
      };
    });

    const columnCount = Math.min(convertedTestCases.length, 3);

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: '12px',
        marginTop: '24px'
      }}>
        {convertedTestCases.map((testCase, i) => (
          <TestCase key={i} {...testCase} />
        ))}
      </div>
    );
  }

  // Handle direct testCases format (legacy support if needed)
  if (!testCases || testCases.length === 0) {
    return null;
  }

  // Determine grid columns (1-3 max)
  const columnCount = Math.min(testCases.length, 3);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      gap: '12px',
      marginTop: '24px'
    }}>
      {testCases.map((testCase, i) => (
        <TestCase key={i} {...testCase} />
      ))}
    </div>
  );
}
