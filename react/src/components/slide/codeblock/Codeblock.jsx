import { useState, useCallback, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import TestResults from './tests/TestResults.jsx';
import { executeMarkdownTest } from './tests/runner/TestRunner.js';

export default function Codeblock({
  code,
  testComment,
  readOnly = false
}) {
  const [userCode, setUserCode] = useState(code);
  const [testResults, setTestResults] = useState(null);

  const hasTests = !!testComment;

  const runTests = useCallback((codeToTest) => {
    if (testComment) {
      console.log('Running tests with code:', codeToTest);
      console.log('Test comment:', testComment);

      const results = executeMarkdownTest(codeToTest, testComment);
      console.log('Test results:', results);

      setTestResults(results);
      return results;
    }
    return null;
  }, [testComment]);

  const handleRunTests = useCallback((codeArg) => {
    const codeUsed = typeof codeArg === 'string' ? codeArg : userCode;
    console.log('Play button clicked, running tests with:', codeUsed);
    runTests(codeUsed);
    setUserCode(codeUsed);
  }, [userCode, runTests]);

  const handleCodeChange = (newCode) => {
    console.log('Code changed to:', newCode);
    setUserCode(newCode);
    // Run tests automatically on change if there are test comments
    if (testComment) {
      runTests(newCode);
    }
  };

  // Run initial tests when component mounts
  useEffect(() => {
    if (testComment && code) {
      console.log('Initial test run on mount');
      runTests(code);
    }
  }, [testComment, code, runTests]);

  return (
    <div>
      <CodeEditor
        value={userCode}
        onChange={handleCodeChange}
        onRunTests={handleRunTests}
        showRun={hasTests}
        readOnly={readOnly}
      />
      {hasTests && (
        <TestResults testResult={testResults} />
      )}
    </div>
  );
}
