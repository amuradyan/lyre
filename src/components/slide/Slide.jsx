import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Codeblock from './codeblock/Codeblock.jsx';
import LyreCodeblock from './codeblock/LyreCodeblock.jsx';
import PlayableJsCodeblock from './codeblock/PlayableJsCodeblock.jsx';
import TabbedCodeblock from './codeblock/TabbedCodeblock.jsx';
import { loadCodeBlock } from '../../utils/slideStorage.js';
import { parseMarkdown } from '../../utils/markdownParser.js';
import SlideNavigator from './SlideNavigator.jsx';
import KeyboardShortcutsModal from './KeyboardShortcutsModal.jsx';
import { SLIDES } from '../../config/slides.js';

function CollapsibleParagraph({ content }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="text-gray-700 text-left cursor-pointer select-none"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <span className="inline-block w-4 mr-2 text-gray-400">
        {isExpanded ? '−' : '+'}
      </span>
      {isExpanded ? (
        <span dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <span className="text-gray-500">
          <span dangerouslySetInnerHTML={{ __html: content.split(' ').slice(0, 10).join(' ') }} />
          {content.split(' ').length > 10 && '... '}
          <span className="text-indigo-400 text-sm">(click to expand)</span>
        </span>
      )}
    </div>
  );
}

function joinUrlFs(path) {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    if (path.startsWith('/')) {
      return encodeURI(`/@fs${path}`);
    }
    const absolutePath = `${__WORKSPACE_ROOT__}/${path.replace(/^(\.\.\/)+/, '')}`;
    return encodeURI(`/@fs${absolutePath}`);
  } else {
    if (path.includes('/notes/')) {
      const notesIndex = path.indexOf('/notes/');
      return encodeURI(path.substring(notesIndex));
    }
    if (path.startsWith('/src/assets/')) {
      return encodeURI(path.replace('/src/assets/', '/assets/'));
    }
    return encodeURI(`/notes/${path.replace(/^(\.\.\/)+/, '')}`);
  }
}

export default function SlideExperimental({ initialMarkdownPath }) {
  const [mdPath, setMdPath] = useState(initialMarkdownPath);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testStatuses, setTestStatuses] = useState({});
  const [slugToPathMap, setSlugToPathMap] = useState({});
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const handleNextRef = useRef();
  const handleBackRef = useRef();
  const handleHomeRef = useRef();
  const handleEndRef = useRef();

  const extractSlideIndex = (path) => {
    const filename = path.split('/').pop();
    const match = filename.match(/^(\d+)\s+/);
    return match ? parseInt(match[1]) + 1 : null;
  };

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
    return SLIDES.find(slide => pathToSlug(slide.path) === slug)?.path;
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

  const slideIndex = useMemo(() => {
    if (!mdPath) return null;
    const currentIndex = extractSlideIndex(mdPath);
    if (currentIndex === null) return null;
    return { current: currentIndex, total: SLIDES.length };
  }, [mdPath]);

  const allTestsPassing = useMemo(() => {
    const codeBlocksWithTests = parsed.content?.filter(block =>
      (block.type === 'codeblock' && block.testComment) ||
      (block.type === 'codeblock-group' && block.testComment)
    ) || [];

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

  const handleHome = () => {
    if (SLIDES.length === 0) return;
    const firstSlide = SLIDES[0].path;
    setMdPath(firstSlide);
    updateUrl(firstSlide);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnd = () => {
    if (SLIDES.length === 0) return;
    const lastSlide = SLIDES[SLIDES.length - 1].path;
    setMdPath(lastSlide);
    updateUrl(lastSlide);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    handleNextRef.current = handleNext;
    handleBackRef.current = handleBack;
    handleHomeRef.current = handleHome;
    handleEndRef.current = handleEnd;
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleBackRef.current?.();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextRef.current?.();
      } else if (e.key === 'Home') {
        e.preventDefault();
        handleHomeRef.current?.();
      } else if (e.key === 'End') {
        e.preventDefault();
        handleEndRef.current?.();
      } else if (e.key === '.') {
        e.preventDefault();
        setHelpModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="bg-white/70 backdrop-blur shadow-sm relative" style={{ padding: '32px 32px 32px 32px' }}>
      <style>{`
        .nav-button {
          text-decoration: underline;
          transition: all 0.2s;
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
        .slide-index {
          cursor: pointer;
          transition: color 0.2s;
          color: #9ca3af;
        }
        .slide-index:hover {
          color: #6366f1;
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
                } else if (item.type === 'collapsible') {
                  return <CollapsibleParagraph key={i} content={item.content} />;
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
                } else if (item.type === 'image') {
                  const resolveImagePath = (src) => {
                    if (src.startsWith('http://') || src.startsWith('https://')) {
                      return src;
                    }
                    return joinUrlFs(src);
                  };
                  return (
                    <img
                      key={i}
                      src={resolveImagePath(item.src)}
                      alt={item.alt}
                      className="max-w-full h-auto my-6 mx-auto"
                    />
                  );
                } else if (item.type === 'codeblock-group') {
                  const testBlockIndex = item.testComment ? testBlockCounter++ : -1;
                  const savedCodes = item.blocks.map(block =>
                    parsed.slideId ? loadCodeBlock(parsed.slideId, block.code) : null
                  );
                  return (
                    <TabbedCodeblock
                      key={i}
                      blocks={item.blocks}
                      savedCodes={savedCodes}
                      groupPlayable={item.playable}
                      slideId={parsed.slideId}
                      blockIndex={i}
                      testComment={item.testComment}
                      onTestStatusChange={testBlockIndex >= 0 ? (isPassing) => handleTestStatusChange(testBlockIndex, isPassing) : undefined}
                    />
                  );
                } else if (item.type === 'codeblock') {
                  if (item.playable) {
                    return (
                      <PlayableJsCodeblock
                        key={i}
                        code={item.code}
                        readOnly={false}
                        slideId={parsed.slideId}
                        blockIndex={i}
                      />
                    );
                  } else if (item.language === 'lyre') {
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
                        hints={item.hints}
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
            <div className="flex justify-between items-center" style={{ marginTop: '48px' }}>
              {parsed.backHref ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center font-semibold nav-button"
                  style={{
                    gap: '8px', padding: '12px 24px',
                    background: 'transparent', border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#6366f1', fontFamily: 'Nunito, sans-serif',
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
              {slideIndex && (
                <div
                  className="slide-index"
                  onClick={() => setNavigatorOpen(true)}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  {slideIndex.current}/{slideIndex.total}
                </div>
              )}
              {parsed.nextHref && (
                <div className="inline-flex">
                  <button
                    onClick={handleNext}
                    disabled={!allTestsPassing}
                    className={`inline-flex items-center font-semibold ${allTestsPassing ? 'nav-button' : ''}`}
                    style={{
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'transparent',
                      border: allTestsPassing ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(156, 163, 175, 0.3)',
                      color: allTestsPassing ? '#6366f1' : '#9ca3af',
                      fontFamily: 'Nunito, sans-serif',
                      fontWeight: 600,
                      cursor: allTestsPassing ? 'pointer' : 'not-allowed',
                      textDecoration: allTestsPassing ? 'underline' : 'none'
                    }}
                  >
                    {parsed.nextText || 'Next'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                      <path d="M10 5l7 7-7 7" />
                    </svg>
                  </button>
                  {parsed.skipHref && (
                    <div className="skip-tooltip-container">
                      <button
                        onClick={handleSkip}
                        className={`inline-flex items-center font-semibold ${allTestsPassing ? 'nav-button' : ''}`}
                        style={{
                          padding: '12px',
                          background: 'transparent',
                          border: allTestsPassing ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(156, 163, 175, 0.3)',
                          borderLeft: 'none',
                          color: allTestsPassing ? '#6366f1' : '#9ca3af',
                          fontFamily: 'Nunito, sans-serif',
                          fontWeight: 600,
                          cursor: allTestsPassing ? 'pointer' : 'not-allowed',
                          textDecoration: allTestsPassing ? 'underline' : 'none'
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                          <path d="M3 5l7 7-7 7" />
                          <path d="M10 5l7 7-7 7" />
                        </svg>
                      </button>
                      <span className="skip-tooltip">Skip exercises</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {navigatorOpen && createPortal(
        <SlideNavigator
          currentIndex={slideIndex?.current}
          onNavigate={(path) => {
            setMdPath(path);
            updateUrl(path);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onClose={() => setNavigatorOpen(false)}
        />,
        document.body
      )}
      {helpModalOpen && createPortal(
        <KeyboardShortcutsModal
          onClose={() => setHelpModalOpen(false)}
        />,
        document.body
      )}
    </div>
  );
}
