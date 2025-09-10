import { useEffect, useMemo, useState, useCallback } from 'react';
import Codeblock from './codeblock/Codeblock.jsx';

function joinUrlFs(path) {
  if (path.startsWith('/')) {
    return encodeURI(`/@fs${path}`);
  }

  const absolutePath = `${__WORKSPACE_ROOT__}/${path.replace(/^\.\.\//, '')}`;
  return encodeURI(`/@fs${absolutePath}`);
}

function parseMarkdown(md) {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let title = '';
  let inCode = false;
  let currentPara = [];
  const content = [];
  let codeBuffer = [];
  let nextHref = null;
  let nextText = null;
  let backHref = null;
  let backText = null;
  let inNext = false;
  let inBack = false;

  const processInlineCode = (text) => {
    return text.replace(/`([^`]+)`/g, (match, code) => {
      return `<code class="inline-code">${code}</code>`;
    });
  };

  const flushParagraph = () => {
    if (currentPara.length) {
      const paraText = currentPara.join(' ').trim();
      content.push({
        type: 'paragraph',
        content: processInlineCode(paraText)
      });
      currentPara = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!inCode && line.startsWith('# ')) {
      if (!title) title = line.replace(/^#\s+/, '').trim();
      continue;
    }

    if (!inCode && /^##\s+Next(\s+section)?\s*$/i.test(line.trim())) {
      flushParagraph();
      inNext = true;
      inBack = false;
      continue;
    }

    if (!inCode && /^##\s+Back(\s+section)?\s*$/i.test(line.trim())) {
      flushParagraph();
      inBack = true;
      inNext = false;
      continue;
    }

    if (inNext) {
      const m = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        nextText = m[1].trim();
        nextHref = m[2].trim();
        inNext = false;
      }
      continue;
    }

    if (inBack) {
      const m = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        backText = m[1].trim();
        backHref = m[2].trim();
        inBack = false;
      }
      continue;
    }

    if (line.startsWith('```')) {
      if (inCode) {
        const code = codeBuffer.join('\n');
        let testComment = null;

        if (i + 1 < lines.length) {
          let commentLines = [];
          let j = i + 1;
          let foundStart = false;
          let foundEnd = false;

          while (j < lines.length && !foundEnd) {
            const currentLine = lines[j].trim();

            if (!foundStart && currentLine.startsWith('<!--')) {
              foundStart = true;
              commentLines.push(lines[j]);
              if (currentLine.includes('-->')) {
                foundEnd = true;
              }
            } else if (foundStart && !foundEnd) {
              commentLines.push(lines[j]);
              if (currentLine.includes('-->')) {
                foundEnd = true;
              }
            } else if (!foundStart && currentLine !== '') {
              break;
            }

            j++;
          }

          if (foundStart && foundEnd) {
            testComment = commentLines.join('\n');
            i = j - 1;
          }
        }

        content.push({
          type: 'codeblock',
          code,
          testComment
        });
        codeBuffer = [];
        inCode = false;
      } else {
        flushParagraph();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (/^#/.test(line)) {
      flushParagraph();
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
    } else {
      currentPara.push(line.trim());
    }
  }

  flushParagraph();

  return { title, content, nextHref, nextText, backHref, backText };
}

export default function SlideExperimental({ initialMarkdownPath }) {
  const [mdPath, setMdPath] = useState(initialMarkdownPath);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testStatuses, setTestStatuses] = useState({});

  const parsed = useMemo(() => parseMarkdown(content || ''), [content]);

  const allTestsPassing = useMemo(() => {
    const codeBlocksWithTests = parsed.content?.filter(block => block.type === 'codeblock' && block.testComment) || [];

    if (codeBlocksWithTests.length === 0) {
      return true;
    }

    const hasAllResults = codeBlocksWithTests.every((_, index) =>
      testStatuses[index] !== undefined
    );

    if (!hasAllResults) {
      return false;
    }

    return codeBlocksWithTests.every((_, index) => testStatuses[index] === true);
  }, [parsed.content, testStatuses]);

  const handleTestStatusChange = useCallback((blockIndex, isPassing) => {
    setTestStatuses(prev => ({
      ...prev,
      [blockIndex]: isPassing
    }));
  }, []);

  useEffect(() => {
    setTestStatuses({});
  }, [content]);

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

  const handleNext = () => {
    const { nextHref } = parsed;
    if (!nextHref || !allTestsPassing) return;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    const { backHref } = parsed;
    if (!backHref) return;
    const idx = mdPath.indexOf('/notes/');
    const repoRoot = idx >= 0 ? mdPath.slice(0, idx) : mdPath.substring(0, mdPath.lastIndexOf('/'));
    const mdDir = mdPath.substring(0, mdPath.lastIndexOf('/'));
    let target = backHref;
    try { target = decodeURIComponent(backHref); } catch {}

    let backAbs;
    if (target.startsWith('/')) {
      backAbs = `${repoRoot}${target}`;
    } else if (target.startsWith('notes/')) {
      backAbs = `${repoRoot}/${target}`;
    } else {
      backAbs = `${mdDir}/${target}`;
    }

    setMdPath(backAbs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            {parsed.content.map((item, i) => {
              if (item.type === 'paragraph') {
                return <p key={i} className="text-gray-700 text-left" dangerouslySetInnerHTML={{ __html: item.content }} />;
              } else if (item.type === 'codeblock') {
                const codeBlocksWithTests = parsed.content.filter(block => block.type === 'codeblock' && block.testComment);
                const testBlockIndex = codeBlocksWithTests.findIndex(block => block === item);

                return (
                  <Codeblock
                    key={i}
                    code={item.code}
                    testComment={item.testComment}
                    onTestStatusChange={(isPassing) => handleTestStatusChange(testBlockIndex, isPassing)}
                  />
                );
              }
              return null;
            })}
          </div>
          {(parsed.backHref || parsed.nextHref) && (
            <div className="flex justify-between" style={{ marginTop: '48px' }}>
              {parsed.backHref ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center font-semibold transition-all duration-200"
                  style={{
                    gap: '8px', padding: '12px 24px',
                    background: '#2563eb', border: 'none',
                    color: 'white', fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  {parsed.backText || 'Back'}
                </button>
              ) : (
                <div />
              )}
              {parsed.nextHref && (
                <button
                  onClick={handleNext}
                  disabled={!allTestsPassing}
                  className="inline-flex items-center font-semibold transition-all duration-200"
                  style={{
                    gap: '8px', padding: '12px 24px',
                    background: allTestsPassing ? '#2563eb' : '#f3f4f6',
                    border: 'none',
                    color: allTestsPassing ? 'white' : '#9ca3af',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    cursor: allTestsPassing ? 'pointer' : 'not-allowed'
                  }}
                >
                  {parsed.nextText || 'Next'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
