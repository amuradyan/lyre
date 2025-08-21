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
      const results = executeMarkdownTest(codeToTest, testComment);
      setTestResults(results);
      return results;
    }
    return null;
  }, [testComment]);

  const handleCodeChange = (newCode) => {
    setUserCode(newCode);
    // Run tests automatically on change if there are test comments
    if (testComment) {
      runTests(newCode);
    }
  };

  // Run initial tests when component mounts
  useEffect(() => {
    if (testComment && code) {
      runTests(code);
    }
  }, [testComment, code, runTests]);

  return (
    <div>
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
