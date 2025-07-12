interface TestResult {
  n: number;
  value: number;
  expected: number;
  passed: boolean;
}

interface TestResultsProps {
  results: TestResult[] | null;
}

export default function TestResults({ results }: TestResultsProps) {
  // Test data for initial display when no results yet
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
          // Show pending state - match static version exactly
          return (
            <div key={i} style={{
              padding: '8px 0',
              background: '#f6f8fa',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '13px'
            }}>
              <span style={{
                textAlign: 'center',
                padding: '0 10px',
                whiteSpace: 'nowrap',
                width: `${test.n}!`.length * 8 + 'px',
                display: 'inline-block',
                color: '#6e7681'
              }}>
                {test.n}!
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center'
              }}>
                <span style={{ color: '#6e7681' }}>? = {test.expected}</span>
              </div>
            </div>
          );
        }

        const isSuccess = result.passed;
        const color = isSuccess ? '#2ea043' : '#f85149';

        return (
          <div key={i} style={{
            padding: '8px 0',
            background: '#f6f8fa',
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '13px'
          }}>
            <span style={{
              textAlign: 'center',
              padding: '0 10px',
              whiteSpace: 'nowrap',
              width: `${test.n}!`.length * 8 + 'px',
              display: 'inline-block',
              color: color
            }}>
              {test.n}!
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center'
            }}>
              <span style={{ color: color }}>
                {isNaN(result.value) ? 'Error' : result.value} {isSuccess ? '=' : '≠'} {result.expected}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
