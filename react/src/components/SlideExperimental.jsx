import { useEffect, useMemo, useState } from 'react';
import CodeEditor from './codeblock/CodeEditor.jsx';

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
        codeBlocks.push(codeBuffer.join('\n'));
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

export default function SlideExperimental({ initialMarkdownPath }) {
  const [mdPath, setMdPath] = useState(initialMarkdownPath);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
            {parsed.paragraphs.map((p, i) => (
              <p key={i} className="text-gray-700 text-left">{p}</p>
            ))}
          </div>
          <div className="flex flex-col space-y-6">
            {parsed.codeBlocks.map((code, i) => (
              <div key={i}>
                <CodeEditor value={code} onChange={() => {}} onRunTests={() => {}} showRun={false} />
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
