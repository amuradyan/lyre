import { useState } from 'react';
import ProblemDescription from './ProblemDescription.jsx';
import CodeEditor from './CodeEditor.jsx';
import TestResults from './TestResults.jsx';
import NextChapterButton from './NextChapterButton.jsx';
import StatusMessage from './StatusMessage.jsx';
import { executeTests } from './TestRunner.js';

export default function Slide({ problem, initialCode = `function factorial(n) {\n  // your code here\n}` }) {
  const [userCode, setUserCode] = useState(initialCode);
  const [testResults, setTestResults] = useState(null);

  const handleRunTests = () => {
    const results = executeTests(userCode);
    setTestResults(results);
  };

  const allTestsPassed = testResults?.every(r => r.passed) ?? false;

  return (
    <div className="bg-white material-shadow p-6">
      <ProblemDescription {...problem} />
      <CodeEditor
        initialValue={userCode}
        onChange={setUserCode}
        onRunTests={handleRunTests}
      />
      <TestResults results={testResults} />
      <div className="flex flex-col items-center mt-8">
        <NextChapterButton allTestsPassed={allTestsPassed} />
        <StatusMessage allTestsPassed={allTestsPassed} />
      </div>
    </div>
  );
}
