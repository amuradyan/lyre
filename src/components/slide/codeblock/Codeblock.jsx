import { useState, useCallback, useEffect, useRef } from 'react';
import CodeEditor from './CodeEditor.jsx';
import TestResults from './tests/TestResults.jsx';
import { executeMarkdownTest } from './tests/runner/TestRunner.js';
import { saveCodeBlock, saveHintState, loadHintState } from '../../../utils/slideStorage.js';
import { mergeHintsIntoEdited } from '../../../utils/hintMerger.js';

function stripHints(code) {
  return code
    .replace(/^\s*\/\*\s*#![\s\S]*?\*\/\s*$\n?/gm, '')
    .replace(/\/\*\s*#![\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !/^\s*\/\/\s*#!/.test(line))
    .map(line => line.replace(/\/\/\s*#!.*$/, '').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

export default function Codeblock({
  code,
  savedCode,
  slideId,
  blockIndex,
  testComment,
  readOnly = false,
  onTestStatusChange,
  hints
}) {
  const initialCode = code;
  const initialHintsVisible = hints && hints.length > 0 ? loadHintState(slideId, blockIndex) : false;

  const [hintsVisible, setHintsVisible] = useState(initialHintsVisible);
  const [userCode, setUserCode] = useState(() => {
    if (hints && hints.length > 0) {
      if (initialHintsVisible) {
        return savedCode || initialCode;
      } else {
        return savedCode ? stripHints(savedCode) : stripHints(initialCode);
      }
    }
    return savedCode || initialCode;
  });
  const [testResults, setTestResults] = useState(null);
  const onTestStatusChangeRef = useRef(onTestStatusChange);

  const hasTests = !!testComment;
  const hasHints = hints && hints.length > 0;
  
  useEffect(() => {
    onTestStatusChangeRef.current = onTestStatusChange;
  }, [onTestStatusChange]);

  const runTests = useCallback((codeToTest) => {
    if (testComment) {
      const results = executeMarkdownTest(codeToTest, testComment);
      setTestResults(results);

      const hasPassingTests = results.results?.some(r => r.passed) ?? false;

      if (onTestStatusChangeRef.current) {
        onTestStatusChangeRef.current(hasPassingTests);
      }

      if (hasPassingTests && slideId !== undefined) {
        saveCodeBlock(slideId, initialCode, codeToTest);
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

  const handleHintToggle = () => {
    const newHintsVisible = !hintsVisible;

    if (newHintsVisible) {
      const strippedOriginal = stripHints(initialCode);

      if (userCode == strippedOriginal || userCode == initialCode) {
        setUserCode(initialCode);
      } else {
        const result = mergeHintsIntoEdited(initialCode, userCode);

        if (!result.success) {
          const shouldReset = window.confirm(
            'Code structure changed. Reset to original with hints?'
          );

          if (shouldReset) {
            setUserCode(initialCode);
          } else {
            return;
          }
        } else {
          setUserCode(result.code);
        }
      }
    } else {
      setUserCode(stripHints(userCode));
    }

    setHintsVisible(newHintsVisible);
    saveHintState(slideId, newHintsVisible, blockIndex);
  };

  useEffect(() => {
    const initialCode = savedCode || code;
    if (testComment && initialCode) {
      const results = executeMarkdownTest(initialCode, testComment);
      setTestResults(results);

      const hasPassingTests = results.results?.some(r => r.passed) ?? false;

      if (onTestStatusChangeRef.current) {
        onTestStatusChangeRef.current(hasPassingTests);
      }

      if (hasPassingTests && slideId !== undefined) {
        saveCodeBlock(slideId, initialCode, initialCode);
      }
    } else if (onTestStatusChangeRef.current) {
      onTestStatusChangeRef.current(true);
    }
  }, [testComment, savedCode, code, slideId, blockIndex]);

  useEffect(() => {
    if (hints && hints.length > 0) {
      if (hintsVisible) {
        setUserCode(savedCode || initialCode);
      } else {
        setUserCode(savedCode ? stripHints(savedCode) : stripHints(initialCode));
      }
    } else {
      setUserCode(savedCode || initialCode);
    }
  }, [savedCode, initialCode, hintsVisible, hints]);

  return (
    <div style={{ marginTop: '2vh' }}>
      <div className="bg-white/70 backdrop-blur shadow-sm overflow-hidden relative">
        <CodeEditor
          value={userCode}
          onChange={handleCodeChange}
          readOnly={readOnly || !hasTests}
        />
        {hasHints && (
          <button
            onClick={handleHintToggle}
            className="absolute flex items-center justify-center w-6 h-6 backdrop-blur text-white transition-all duration-200"
            style={{
              top: '8px',
              right: '8px',
              zIndex: 9999,
              backgroundColor: '#6366f1',
              cursor: 'pointer',
              opacity: hintsVisible ? 1 : 0.5
            }}
            title={hintsVisible ? 'Hide hints' : 'Show hints'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              {hintsVisible ? (
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              ) : (
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              )}
            </svg>
          </button>
        )}
      </div>
      {hasTests && (
        <TestResults testResult={testResults} />
      )}
    </div>
  );
}
