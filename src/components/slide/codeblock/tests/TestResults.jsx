import TestCase from './TestCase.jsx';

export default function TestResults({ testCases, testResult }) {
  if (testResult) {
    if (!testResult) {
      return null;
    }

    const layout = testResult.layout || 'grid';
    const getColumnCount = (caseCount) => layout === 'row' ? 1 : Math.min(caseCount, 3);

    if (!testResult.success && testResult.error) {
      const errorTestCase = {
        message: `Test Error: ${testResult.error}`,
        passed: false,
        error: testResult.error,
        color: '#f85149'
      };
      const cases = [errorTestCase];
      const columnCount = getColumnCount(cases.length);

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          columnGap: '12px',
          rowGap: '6px',
          marginTop: '12px'
        }}>
          {cases.map((testCase, i) => (
            <TestCase key={i} {...testCase} />
          ))}
        </div>
      );
    }

    if (testResult.message) {
      const noTestCase = {
        message: testResult.message,
        passed: true,
        color: '#6e7681'
      };
      const cases = [noTestCase];
      const columnCount = getColumnCount(cases.length);

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
          columnGap: '12px',
          rowGap: '6px',
          marginTop: '12px'
        }}>
          {cases.map((testCase, i) => (
            <TestCase key={i} {...testCase} />
          ))}
        </div>
      );
    }

    const { results, type } = testResult;

    const convertedTestCases = results.map((result) => {
      const { input, expected, actual, passed, error } = result;

      return {
        input: input,
        expected,
        actual,
        passed,
        error,
        color: error ? '#f85149' : (passed ? '#2ea043' : '#f85149')
      };
    });

    const columnCount = getColumnCount(convertedTestCases.length);

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        columnGap: '12px',
        rowGap: '6px',
        marginTop: '12px'
      }}>
        {convertedTestCases.map((testCase, i) => (
          <TestCase key={i} {...testCase} />
        ))}
      </div>
    );
  }

  if (!testCases || testCases.length === 0) {
    return null;
  }

  const columnCount = Math.min(testCases.length, 3);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      gap: '12px',
      marginTop: '12px'
    }}>
      {testCases.map((testCase, i) => (
        <TestCase key={i} {...testCase} />
      ))}
    </div>
  );
}
