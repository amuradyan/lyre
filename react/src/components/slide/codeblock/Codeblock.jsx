import { useState, useCallback, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import TestResults from './tests/TestResults.jsx';
import { executeMarkdownTest } from './tests/runner/TestRunner.js';

export default function Codeblock({
  code,
  testComment,
  readOnly = false,
  onTestStatusChange
}) {
  const [userCode, setUserCode] = useState(code);
  const [testResults, setTestResults] = useState(null);

  const hasTests = !!testComment;

  const runTests = useCallback((codeToTest) => {
    if (testComment) {
      const results = executeMarkdownTest(codeToTest, testComment);
      setTestResults(results);

      if (onTestStatusChange) {
        onTestStatusChange(results.success);
      }

      return results;
    }
    return null;
  }, [testComment]);

  const handleCodeChange = (newCode) => {
    setUserCode(newCode);
    if (testComment) {
      runTests(newCode);
    }
  };

  useEffect(() => {
    if (testComment && code) {
      runTests(code);
    } else if (onTestStatusChange) {
      onTestStatusChange(true);
    }
  }, [testComment, code, runTests]);

  return (
    <div style={{ marginTop: '2vh' }}>
      <CodeEditor
        value={userCode}
        onChange={handleCodeChange}
        readOnly={readOnly}
      />
      {hasTests && (
        <TestResults testResult={testResults} />
      )}
    </div>
  );
}
