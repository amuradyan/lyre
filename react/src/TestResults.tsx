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
    <div className="grid grid-cols-3 gap-3 mt-6">
      {testCases.map((test, i) => {
        const result = results?.[i];

        if (!result) {
          // Show pending state - match static version exactly
          return (
            <div key={i} className="py-2 bg-gray-50 flex items-center font-mono text-xs" style={{ background: '#f6f8fa' }}>
              <span className="text-center px-2.5 whitespace-nowrap" style={{
                width: `${test.n}!`.length * 8 + 'px',
                color: '#6e7681'
              }}>
                {test.n}!
              </span>
              <div className="flex-1 text-center">
                <span style={{ color: '#6e7681' }}>? = {test.expected}</span>
              </div>
            </div>
          );
        }

        const isSuccess = result.passed;
        const color = isSuccess ? '#2ea043' : '#f85149';

        return (
          <div key={i} className="py-2 flex items-center font-mono text-xs" style={{ background: '#f6f8fa' }}>
            <span className="text-center px-2.5 whitespace-nowrap" style={{
              width: `${test.n}!`.length * 8 + 'px',
              color: color
            }}>
              {test.n}!
            </span>
            <div className="flex-1 text-center">
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
