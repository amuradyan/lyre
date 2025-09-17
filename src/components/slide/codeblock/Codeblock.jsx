import { useState, useCallback, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor.jsx';
import TestResults from './tests/TestResults.jsx';
import { executeMarkdownTest } from './tests/runner/TestRunner.js';
import { saveCodeBlock } from '../../../utils/slideStorage.js';

export default function Codeblock({
  code,
  savedCode,
  slideId,
  blockIndex,
  testComment,
  readOnly = false,
  onTestStatusChange
}) {
  const [userCode, setUserCode] = useState(savedCode || code);
  const [testResults, setTestResults] = useState(null);
  const onTestStatusChangeRef = useRef(onTestStatusChange);

  const hasTests = !!testComment;
  
  useEffect(() => {
    onTestStatusChangeRef.current = onTestStatusChange;
  }, [onTestStatusChange]);

  const runTests = useCallback((codeToTest) => {
    if (testComment) {
      const results = executeMarkdownTest(codeToTest, testComment);
      setTestResults(results);

      if (onTestStatusChangeRef.current) {
        onTestStatusChangeRef.current(results.success);
      }

      if (results.success && slideId !== undefined && blockIndex !== undefined) {
        saveCodeBlock(slideId, blockIndex, codeToTest);
      }

      return results;
    }
    return null;
  }, [testComment, slideId, blockIndex]);

  const handleCodeChange = (newCode) => {
    setUserCode(newCode);
    if (testComment) {
      runTests(newCode);
    }
  };

  useEffect(() => {
    const initialCode = savedCode || code;
    if (testComment && initialCode) {
      const results = executeMarkdownTest(initialCode, testComment);
      setTestResults(results);

      if (onTestStatusChangeRef.current) {
        onTestStatusChangeRef.current(results.success);
      }

      if (results.success && slideId !== undefined && blockIndex !== undefined) {
        saveCodeBlock(slideId, blockIndex, initialCode);
      }
    } else if (onTestStatusChangeRef.current) {
      onTestStatusChangeRef.current(true);
    }
  }, [testComment, savedCode, code, slideId, blockIndex]);

  useEffect(() => {
    setUserCode(savedCode || code);
  }, [savedCode, code]);

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
