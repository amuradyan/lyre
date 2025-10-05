import { useEffect, useMemo, useState, useCallback } from 'react';
import Codeblock from './codeblock/Codeblock.jsx';
import LyreCodeblock from './codeblock/LyreCodeblock.jsx';
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

  const slugToPath = (slug) => {
    const slugMappings = {
      'what-i-want-to-get': './notes/Lyre/0 What I want to get.md',
      'where-do-i-start': './notes/Lyre/1 Where do I start.md',
      'exercises-on-functions': './notes/Lyre/2 Exercises on functions.md'
    };
    return slugMappings[slug];
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
      const pathFromSlug = slugToPath(slug);
      if (pathFromSlug) {
        setMdPath(pathFromSlug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (slugToPathMap[slug]) {
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
      const pathFromSlug = slugToPath(slug);
      if (pathFromSlug) {
        setMdPath(pathFromSlug);
      } else if (slugToPathMap[slug]) {
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

  const handleSkip = () => {
    const { skipHref } = parsed;
    if (!skipHref) return;
    const idx = mdPath.indexOf('/notes/');
    const repoRoot = idx >= 0 ? mdPath.slice(0, idx) : mdPath.substring(0, mdPath.lastIndexOf('/'));
    const mdDir = mdPath.substring(0, mdPath.lastIndexOf('/'));
    let target = skipHref;
    try { target = decodeURIComponent(skipHref); } catch { }

    let skipAbs;
    if (target.startsWith('/')) {
      skipAbs = `${repoRoot}${target}`;
    } else if (target.startsWith('notes/')) {
      skipAbs = `${repoRoot}/${target}`;
    } else {
      skipAbs = `${mdDir}/${target}`;
    }

    setMdPath(skipAbs);
    updateUrl(skipAbs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white/70 backdrop-blur shadow-sm relative" style={{ padding: '32px 32px 32px 32px' }}>
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .skip-arrow:hover .skip-wiggle {
          animation: wiggle 0.3s ease-in-out infinite;
        }
        .skip-tooltip-container {
          position: relative;
          display: inline-flex;
        }
        .skip-tooltip {
          position: absolute;
          bottom: 100%;
          right: 0;
          margin-bottom: 8px;
          padding: 6px 10px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 12px;
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        .skip-tooltip-container:hover .skip-tooltip {
          opacity: 1;
        }
      `}</style>
      {/* Logo Tab */}
      <div
        className="absolute -top-2 right-8 bg-white/80 backdrop-blur px-3 py-2 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => window.location.hash = ''}
      >
        <img
          src="/lyre-logo.png"
          alt="Lyre"
          className="w-4 h-auto"
        />
      </div>

      {loading && <div className="text-gray-500">Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {!loading && !error && (
        <div className="px-6 sm:px-10 md:px-16">
          {parsed.title && (
            <h1 className="text-3xl font-bold text-left mb-8">{parsed.title}</h1>
          )}
          <div className="space-y-6 text-left">
            {(() => {
              let testBlockCounter = 0;
              return parsed.content.map((item, i) => {
                if (item.type === 'paragraph') {
                  return <p key={i} className="text-gray-700 text-left" dangerouslySetInnerHTML={{ __html: item.content }} />;
                } else if (item.type === 'list') {
                  return (
                    <ul key={i} className="text-gray-700 text-left list-disc list-inside space-y-1 ml-8">
                      {item.items.map((listItem, j) => (
                        <li key={j} dangerouslySetInnerHTML={{ __html: listItem }} />
                      ))}
                    </ul>
                  );
                } else if (item.type === 'blockquote') {
                  return (
                    <blockquote key={i} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 text-left">
                      <p dangerouslySetInnerHTML={{ __html: item.content }} />
                    </blockquote>
                  );
                } else if (item.type === 'indented') {
                  return (
                    <div key={i} className="ml-8 text-gray-700 text-left whitespace-pre-line">
                      <div dangerouslySetInnerHTML={{ __html: item.content }} />
                    </div>
                  );
                } else if (item.type === 'header') {
                  const HeaderTag = `h${item.level}`;
                  const headerClass = item.level === 2 ? "text-xl font-semibold text-gray-800 mt-6 mb-4" :
                    item.level === 3 ? "text-lg font-medium text-gray-700 mt-4 mb-3" :
                      "text-base font-medium text-gray-600 mt-3 mb-2";
                  return <HeaderTag key={i} className={headerClass} dangerouslySetInnerHTML={{ __html: item.text }} />;
                } else if (item.type === 'hr') {
                  return <hr key={i} className="border-gray-300 my-6" />;
                } else if (item.type === 'codeblock') {
                  if (item.language === 'lyre') {
                    return (
                      <LyreCodeblock
                        key={i}
                        code={item.code}
                        showContainer={true}
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
          {(parsed.backHref || parsed.nextHref || parsed.skipHref) && (
            <div className="flex justify-between" style={{ marginTop: '48px' }}>
              {parsed.backHref ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center font-semibold transition-all duration-200"
                  style={{
                    gap: '8px', padding: '12px 24px',
                    background: '#6366f1', border: 'none',
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
                  className={`inline-flex items-center font-semibold transition-all duration-200 ${parsed.skipHref ? 'skip-arrow' : ''}`}
                  style={{
                    gap: '8px', padding: '12px 24px',
                    background: allTestsPassing ? '#6366f1' : '#f3f4f6',
                    border: 'none',
                    color: allTestsPassing ? 'white' : '#9ca3af',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    cursor: allTestsPassing ? 'pointer' : 'not-allowed'
                  }}
                >
                  {parsed.nextText || 'Next'}
                  {parsed.skipHref ? (
                    <div className="skip-tooltip-container">
                      <svg
                        className="skip-wiggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSkip();
                        }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: '20px', height: '20px', cursor: 'pointer', filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}
                      >
                        <path d="M5 5l7 7-7 7" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                      <span className="skip-tooltip">Skip exercises</span>
                    </div>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
