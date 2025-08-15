import { useState } from 'react';
import ProblemDescription from './ProblemDescription.jsx';
import NextChapterButton from './NextChapterButton.jsx';
import Codeblock from './codeblock/Codeblock.jsx';

export default function Slide({ problem, initialCode = `function factorial(n) {\n  // your code here\n}` }) {
  const [testResults, setTestResults] = useState(null);

  const allTestsPassed = testResults?.every(r => r.passed) ?? false;

  return (
    <div className="bg-white material-shadow p-6">
      <ProblemDescription {...problem} />
      <Codeblock
        initialCode={initialCode}
        onResults={setTestResults}
        showTests={true}
        readOnly={false}
      />
      <div className="flex flex-col items-center mt-8">
        <NextChapterButton allTestsPassed={allTestsPassed} />
      </div>
    </div>
  );
}
