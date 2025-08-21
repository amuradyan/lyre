import { useState, useCallback } from 'react';
import CodeEditor from './CodeEditor.jsx';
import TestResults from './TestResults.jsx';
import { executeMarkdownTest } from './MarkdownTestRunner.js';

export default function Codeblock({
  code,
  testComment,
  readOnly = false
}) {
  const [userCode, setUserCode] = useState(code);
  const [testResults, setTestResults] = useState(null);

  const hasTests = !!testComment;

  const handleRunTests = useCallback((codeArg) => {
    const codeUsed = typeof codeArg === 'string' ? codeArg : userCode;
    if (testComment) {
      const results = executeMarkdownTest(codeUsed, testComment);
      setTestResults(results);
    }
    setUserCode(codeUsed);
  }, [userCode, testComment]);

  const handleCodeChange = (newCode) => {
    setUserCode(newCode);
    // Run tests automatically on change if there are test comments
    if (testComment) {
      const results = executeMarkdownTest(newCode, testComment);
      setTestResults(results);
    }
  };

  // Run initial tests when component mounts
  useState(() => {
    if (testComment && code) {
      const results = executeMarkdownTest(code, testComment);
      setTestResults(results);
    }
  }, []);

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
