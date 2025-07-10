import React from 'react';
import { Test } from '../data/lessons.ts';

interface TestResult {
  n: number;
  value: number | boolean;
  expected: number | boolean;
}

interface TestResultsState {
  results?: TestResult[];
  error?: string;
}

interface TestResultsProps {
  results: TestResultsState | null;
  tests: Test[];
  testFunction: string;
}

const TestResults: React.FC<TestResultsProps> = ({ results, tests, testFunction }) => {
  if (results?.error) {
    return (
      <div className="mt-6">
        <div className="text-red-500">
          <strong>Error:</strong> {results.error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-3 gap-3">
        {tests.map((test, i) => {
          if (!results?.results) {
            return (
              <div key={i} className="results-item">
                <span
                  className="test-name test-pending"
                  style={{
                    width: `${`${test.n}${testFunction === 'factorial' ? '!' : ''}`.length * 8}px`,
                    display: 'inline-block',
                    textAlign: 'center'
                  }}
                >
                  {test.n}{testFunction === 'factorial' ? '!' : ''}
                </span>
                <div className="test-value" style={{ textAlign: 'center' }}>
                  <span className="test-pending">? = {String(test.expected)}</span>
                </div>
              </div>
            );
          }

          const isSuccess = results.results[i].value === test.expected;
          const resultClass = isSuccess ? 'test-success' : 'test-failure';

          return (
            <div key={i} className="results-item">
              <span
                className={`test-name ${resultClass}`}
                style={{
                  width: `${`${test.n}${testFunction === 'factorial' ? '!' : ''}`.length * 8}px`,
                  display: 'inline-block',
                  textAlign: 'center'
                }}
              >
                {test.n}{testFunction === 'factorial' ? '!' : ''}
              </span>
              <div className="test-value" style={{ textAlign: 'center' }}>
                <span className={resultClass}>
                  {String(results.results[i].value)} {isSuccess ? '=' : '≠'} {String(test.expected)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestResults;
