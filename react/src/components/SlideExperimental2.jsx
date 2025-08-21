import { useEffect, useMemo, useState } from 'react';
import CodeEditor from './codeblock/CodeEditor.jsx';
import MarkdownTestResults from './codeblock/MarkdownTestResults.jsx';
import { executeMarkdownTest } from './codeblock/MarkdownTestRunner.js';

function joinUrlFs(absPath) {
  return encodeURI(`/@fs${absPath}`);
}

function parseMarkdown(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  let inCode = false;
  let currentPara = [];
  const paragraphs = [];
  const codeBlocks = [];
  let codeBuffer = [];
  let nextHref = null;
  let nextText = null;
  let inNext = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inCode && line.startsWith('# ')) {
      if (!title) title = line.replace(/^#\s+/, '').trim();
      continue;
    }

    if (!inCode && /^##\s+Next(\s+section)?\s*$/i.test(line.trim())) {
      if (currentPara.length) {
        paragraphs.push(currentPara.join(' ').trim());
        currentPara = [];
      }
      inNext = true;
      continue;
    }

    if (inNext) {
      const m = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        nextText = m[1].trim();
        nextHref = m[2].trim();
        break;
      }
      continue;
    }

    if (line.startsWith('```')) {
      if (inCode) {
        // End of code block - look for test comment on next line
        const code = codeBuffer.join('\n');
        let testComment = null;

        // Check if next line has a test comment
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.startsWith('<!--') && nextLine.includes('-->')) {
            testComment = nextLine;
            i++; // Skip the test comment line in main parsing
          }
        }

        codeBlocks.push({ code, testComment });
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
        if (currentPara.length) {
          paragraphs.push(currentPara.join(' ').trim());
          currentPara = [];
        }
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (/^#/.test(line)) {
      if (currentPara.length) {
        paragraphs.push(currentPara.join(' ').trim());
        currentPara = [];
      }
      continue;
    }

    if (line.trim() === '') {
      if (currentPara.length) {
        paragraphs.push(currentPara.join(' ').trim());
        currentPara = [];
      }
    } else {
      currentPara.push(line.trim());
    }
  }

  if (currentPara.length) paragraphs.push(currentPara.join(' ').trim());

  return { title, paragraphs, codeBlocks, nextHref, nextText };
}

export default function SlideExperimental2({ initialMarkdownPath }) {
  const [mdPath, setMdPath] = useState(initialMarkdownPath);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState({});

  const parsed = useMemo(() => parseMarkdown(content || ''), [content]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!mdPath) return;
      setLoading(true);
      setError(null);
      try {
        const url = joinUrlFs(mdPath);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        const text = await res.text();
        if (!cancelled) setContent(text);
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [mdPath]);

  const handleCodeChange = (index, newCode) => {
    // Update the code block and run tests if there's a test comment
    const codeBlock = parsed.codeBlocks[index];
    if (codeBlock?.testComment) {
      const result = executeMarkdownTest(newCode, codeBlock.testComment);
      setTestResults(prev => ({
        ...prev,
        [index]: result
      }));
    }
  };

  const handleRunTests = (index, code) => {
    const codeBlock = parsed.codeBlocks[index];
    if (codeBlock?.testComment) {
      const result = executeMarkdownTest(code, codeBlock.testComment);
      setTestResults(prev => ({
        ...prev,
        [index]: result
      }));
    }
  };

  const handleNext = () => {
    const { nextHref } = parsed;
    if (!nextHref) return;
    const idx = mdPath.indexOf('/notes/');
    const repoRoot = idx >= 0 ? mdPath.slice(0, idx) : mdPath.substring(0, mdPath.lastIndexOf('/'));
    const mdDir = mdPath.substring(0, mdPath.lastIndexOf('/'));
    let target = nextHref;
    try { target = decodeURIComponent(nextHref); } catch {}

    let nextAbs;
    if (target.startsWith('/')) {
      nextAbs = `${repoRoot}${target}`;
    } else if (target.startsWith('notes/')) {
      nextAbs = `${repoRoot}/${target}`;
    } else {
      nextAbs = `${mdDir}/${target}`;
    }

    setMdPath(nextAbs);
    setTestResults({}); // Clear test results when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Run initial tests for code blocks with test comments
  useEffect(() => {
    const newTestResults = {};
    parsed.codeBlocks.forEach((block, i) => {
      if (block.testComment) {
        const result = executeMarkdownTest(block.code, block.testComment);
        newTestResults[i] = result;
      }
    });
    setTestResults(newTestResults);
  }, [parsed.codeBlocks]);

  return (
    <div className="bg-white material-shadow" style={{ padding: '32px 32px 32px 32px' }}>
      {loading && <div className="text-gray-500">Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && (
        <div className="px-6 sm:px-10 md:px-16">
          {parsed.title && (
            <h1 className="text-3xl font-bold text-left">{parsed.title}</h1>
          )}
          <div className="space-y-6 text-left">
            {parsed.paragraphs.map((p, i) => (
              <p key={i} className="text-gray-700 text-left">{p}</p>
            ))}
          </div>
          <div className="flex flex-col space-y-6">
            {parsed.codeBlocks.map((block, i) => (
              <div key={i}>
                <CodeEditor
                  value={block.code}
                  onChange={(newCode) => handleCodeChange(i, newCode)}
                  onRunTests={(code) => handleRunTests(i, code)}
                  showRun={!!block.testComment}
                />
                {testResults[i] && (
                  <MarkdownTestResults testResult={testResults[i]} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end" style={{ marginTop: '48px' }}>
            <button
              onClick={handleNext}
              disabled={!parsed.nextHref}
              className="inline-flex items-center font-semibold transition-all duration-200"
              style={{
                gap: '8px', padding: '12px 24px',
                background: parsed.nextHref ? '#2563eb' : '#f3f4f6', border: 'none',
                color: parsed.nextHref ? 'white' : '#9ca3af', fontFamily: 'Nunito, sans-serif',
                fontWeight: 600, cursor: parsed.nextHref ? 'pointer' : 'not-allowed'
              }}
            >
              {parsed.nextText || 'Next'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
