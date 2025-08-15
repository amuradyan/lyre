import { useState, useCallback } from 'react';
import CodeEditor from './CodeEditor.jsx';
import TestResults from './TestResults.jsx';
import { executeTests } from './TestRunner.js';

export default function Codeblock({
  initialCode = `function factorial(n) {\n  // your code here\n}`,
  readOnly = false,
  showTests = true,
  showRun: showRunProp,
  onResults,
  onChange
}) {
  const [userCode, setUserCode] = useState(initialCode);
  const [testResults, setTestResults] = useState(null);

  const showRun = showRunProp ?? !readOnly;

  const handleRunTests = useCallback((codeArg) => {
    const codeUsed = typeof codeArg === 'string' ? codeArg : userCode;
    const results = executeTests(codeUsed);
    setUserCode(codeUsed);
    setTestResults(results);
    onResults?.(results);
  }, [userCode, onResults]);

  return (
    <div>
      <CodeEditor
        value={userCode}
        onChange={(v) => { setUserCode(v); onChange?.(v); }}
        onRunTests={handleRunTests}
        showRun={showRun}
        readOnly={readOnly}
      />
      {showTests && (
        <TestResults results={testResults} />
      )}
    </div>
  );
}
