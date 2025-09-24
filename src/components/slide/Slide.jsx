import { useEffect, useMemo, useState, useCallback } from 'react';
import Codeblock from './codeblock/Codeblock.jsx';
import LyreCodeblock from './codeblock/LyreCodeblock.jsx';
import AudioPlayer from '../AudioPlayer.jsx';
import StreamingAudioPlayer from '../StreamingAudioPlayer.jsx';
import LyrePlayer from '../LyrePlayer.jsx';
import { loadCodeBlock } from '../../utils/slideStorage.js';
import { parseMarkdown } from '../../utils/markdownParser.js';

function joinUrlFs(path) {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    if (path.startsWith('/')) {
      return encodeURI(`/@fs${path}`);
    }
    const absolutePath = `${__WORKSPACE_ROOT__}/${path.replace(/^\.\.\//, '')}`;
    return encodeURI(`/@fs${absolutePath}`);
  } else {
    if (path.includes('/notes/')) {
      const notesIndex = path.indexOf('/notes/');
      return encodeURI(path.substring(notesIndex));
    }
    return encodeURI(`/notes/${path.replace(/^\.\.\//, '')}`);
  }
}

export default function SlideExperimental({ initialMarkdownPath }) {
  const [mdPath, setMdPath] = useState(initialMarkdownPath);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testStatuses, setTestStatuses] = useState({});
  const [slugToPathMap, setSlugToPathMap] = useState({});

  const pathToSlug = (path) => {
    const filename = path.split('/').pop();
    const nameWithoutExt = filename.replace(/\.md$/, '');
    const nameWithoutNumber = nameWithoutExt.replace(/^\d+\s+/, '');
    return nameWithoutNumber
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const updateUrl = (path) => {
    const slug = pathToSlug(path);
    setSlugToPathMap(prev => ({ ...prev, [slug]: path }));
    const hash = '#' + slug;
    window.history.pushState({ slidePath: path }, '', hash);
  };

  const handleBrowserNavigation = useCallback((event) => {
    if (event.state && event.state.slidePath) {
      setMdPath(event.state.slidePath);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (window.location.hash) {
      const slug = window.location.hash.slice(1);
      if (slugToPathMap[slug]) {
        setMdPath(slugToPathMap[slug]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [slugToPathMap]);

  useEffect(() => {
    window.addEventListener('popstate', handleBrowserNavigation);
    return () => {
      window.removeEventListener('popstate', handleBrowserNavigation);
    };
  }, [handleBrowserNavigation]);

  useEffect(() => {
    if (window.location.hash) {
      const slug = window.location.hash.slice(1);
      if (slugToPathMap[slug]) {
        setMdPath(slugToPathMap[slug]);
      }
    } else if (mdPath) {
      updateUrl(mdPath);
    }
  }, []);

  useEffect(() => {
    if (mdPath) {
      const slug = pathToSlug(mdPath);
      setSlugToPathMap(prev => ({ ...prev, [slug]: mdPath }));
    }
  }, [mdPath]);

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
  }, [mdPath]);

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
    try { target = decodeURIComponent(nextHref); } catch { }

    let nextAbs;
    if (target.startsWith('/')) {
      nextAbs = `${repoRoot}${target}`;
    } else if (target.startsWith('notes/')) {
      nextAbs = `${repoRoot}/${target}`;
    } else {
      nextAbs = `${mdDir}/${target}`;
    }

    setMdPath(nextAbs);
    updateUrl(nextAbs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    const { backHref } = parsed;
    if (!backHref) return;
    const idx = mdPath.indexOf('/notes/');
    const repoRoot = idx >= 0 ? mdPath.slice(0, idx) : mdPath.substring(0, mdPath.lastIndexOf('/'));
    const mdDir = mdPath.substring(0, mdPath.lastIndexOf('/'));
    let target = backHref;
    try { target = decodeURIComponent(backHref); } catch { }

    let backAbs;
    if (target.startsWith('/')) {
      backAbs = `${repoRoot}${target}`;
    } else if (target.startsWith('notes/')) {
      backAbs = `${repoRoot}/${target}`;
    } else {
      backAbs = `${mdDir}/${target}`;
    }

    setMdPath(backAbs);
    updateUrl(backAbs);
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
            {(() => {
              let testBlockCounter = 0;
              return parsed.content.map((item, i) => {
                if (item.type === 'paragraph') {
                  return <p key={i} className="text-gray-700 text-left" dangerouslySetInnerHTML={{ __html: item.content }} />;
                } else if (item.type === 'codeblock') {
                  if (item.language === 'lyre') {
                    return (
                      <LyreCodeblock
                        key={i}
                        code={item.code}
                      />
                    );
                  } else {
                    const testBlockIndex = item.testComment ? testBlockCounter++ : -1;
                    const savedCode = parsed.slideId ? loadCodeBlock(parsed.slideId, item.code) : null;

                    return (
                      <Codeblock
                        key={i}
                        code={item.code}
                        savedCode={savedCode}
                        slideId={parsed.slideId}
                        blockIndex={i}
                        testComment={item.testComment}
                        onTestStatusChange={testBlockIndex >= 0 ? (isPassing) => handleTestStatusChange(testBlockIndex, isPassing) : undefined}
                      />
                    );
                  }
                }
                return null;
              });
            })()}
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
