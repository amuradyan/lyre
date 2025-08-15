import TestCase from './TestCase.jsx';

export default function TestResults({ results }) {
  const testCases = [
    { n: 0, expected: 1 },
    { n: 1, expected: 1 },
    { n: 3, expected: 6 },
    { n: 5, expected: 120 },
    { n: 7, expected: 5040 },
    { n: 10, expected: 3628800 }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '24px'
    }}>
      {testCases.map((test, i) => {
        const result = results?.[i];

        if (!result) {
          return (
            <TestCase
              key={i}
              test={test}
              message={`? = ${test.expected}`}
              color="#6e7681"
            />
          );
        }

        const isSuccess = result.passed;
        const color = result.error ? '#f85149' : (isSuccess ? '#2ea043' : '#f85149');
        const message = result.error
          ? result.error
          : `${isNaN(result.value) ? 'Error' : result.value} ${isSuccess ? '=' : '≠'} ${test.expected}`;

        return (
          <TestCase
            key={i}
            test={test}
            message={message}
            color={color}
          />
        );
      })}
    </div>
  );
}
