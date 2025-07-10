import React, { useState } from 'react';
import CodeEditor from './CodeEditor.tsx';
import TestResults from './TestResults.tsx';
import { Lesson } from '../data/lessons.ts';

interface LessonPageProps {
  lesson: Lesson;
  isLastPage: boolean;
  onNextChapter: () => void;
}

interface TestResult {
  n: number;
  value: number | boolean;
  expected: number | boolean;
}

interface TestResultsState {
  results?: TestResult[];
  error?: string;
}

const LessonPage: React.FC<LessonPageProps> = ({ lesson, isLastPage, onNextChapter }) => {
  const [testResults, setTestResults] = useState<TestResultsState | null>(null);
  const [code, setCode] = useState(lesson.initialCode);

  const runTests = () => {
    let results: TestResult[] = [];

    try {
      const func = new Function(`${code}; return ${lesson.testFunction};`)();
      results = lesson.tests.map(test => ({
        n: test.n,
        value: func(test.n),
        expected: test.expected
      }));
    } catch (e) {
      setTestResults({ error: (e as Error).message });
      return;
    }

    setTestResults({ results });
  };

  const allTestsPassing = testResults?.results &&
    !testResults.error &&
    testResults.results.every(result => result.value === result.expected);

  const handleNextChapter = () => {
    if (allTestsPassing) {
      if (isLastPage) {
        alert('Course completed! Great job!');
      } else {
        onNextChapter();
      }
    }
  };

  return (
    <div className="material-shadow bg-white p-6 rounded-lg">
      <h2 className="text-2xl font-medium mb-4 text-gray-900">
        {lesson.title}
      </h2>

      <div className="mb-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Problem Description
          </h3>
          <p className="text-gray-600">{lesson.description}</p>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-gray-700">Definition</h4>
          <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: lesson.definition }} />
          <p className="text-gray-600 mt-2">{lesson.note}</p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
          <strong className="text-yellow-800">Tip: </strong>
          <span className="text-yellow-700">{lesson.tip}</span>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-gray-700">Examples</h4>
          <div className="bg-gray-50 p-3 rounded font-mono text-sm whitespace-pre-line">
            {lesson.examples}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-gray-700">Task</h4>
          <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: lesson.task }} />
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            {lesson.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      </div>

      <CodeEditor
        code={code}
        onChange={setCode}
        onRunTests={runTests}
      />

      <TestResults
        results={testResults}
        tests={lesson.tests}
        testFunction={lesson.testFunction}
      />

      <div className="flex flex-col items-center mt-8">
        <button
          className={`next-chapter ${allTestsPassing ? 'enabled' : ''}`}
          onClick={handleNextChapter}
          disabled={!allTestsPassing}
        >
          {isLastPage ? 'Complete Course' : 'Next Chapter'}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="status-message">
          {allTestsPassing
            ? (isLastPage ? 'Congratulations! You have completed the course!' : 'All tests passed! You can proceed to the next chapter.')
            : 'Complete all tests to unlock the next chapter'
          }
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
