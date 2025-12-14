import { useEffect, useState, useRef } from 'react';
import { SLIDES } from '../../config/slides.js';

export default function SlideNavigator({ currentIndex, onNavigate, onPreview, onClose, onHome, onEnd }) {
  const [expandedFolders, setExpandedFolders] = useState({});
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const currentSlideRef = useRef(null);
  const slideRefs = useRef({});
  const hoverTimerRef = useRef(null);
  const originalSlideRef = useRef(null);
  const searchInputRef = useRef(null);

  const fuzzyMatch = (search, text) => {
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();

    let searchIdx = 0;
    for (let i = 0; i < textLower.length && searchIdx < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIdx]) {
        searchIdx++;
      }
    }
    return searchIdx === searchLower.length;
  };

  const slidesWithIndex = SLIDES.map((slide, idx) => ({ ...slide, index: idx + 1 }));

  const filteredSlides = searchQuery
    ? slidesWithIndex.filter(slide =>
        fuzzyMatch(searchQuery, slide.title) ||
        (slide.tags && slide.tags.some(tag => fuzzyMatch(searchQuery, tag)))
      )
    : slidesWithIndex;

  const groupedSlides = filteredSlides.reduce((groups, slide) => {
    const pathParts = slide.path.split('/');
    const folder = pathParts.length > 3 ? pathParts[pathParts.length - 2] : 'Other';

    if (!groups[folder]) {
      groups[folder] = [];
    }

    groups[folder].push(slide);
    return groups;
  }, {});

  const getVisibleSlides = () => {
    const visible = [];
    Object.entries(groupedSlides).forEach(([folder, slides]) => {
      if (expandedFolders[folder]) {
        slides.forEach(slide => visible.push(slide));
      }
    });
    return visible;
  };

  useEffect(() => {
    // Store the original slide when navigator opens
    if (originalSlideRef.current === null) {
      originalSlideRef.current = SLIDES[currentIndex - 1]?.path;
    }

    const handleKeyboard = (e) => {
      if (e.key === 'Escape') {
        if (searchQuery) {
          // Clear search first
          setSearchQuery('');
          setFocusedIndex(null);
          return;
        }
        // Return to original slide on escape
        if (originalSlideRef.current) {
          onNavigate(originalSlideRef.current);
        }
        originalSlideRef.current = null;
        onClose();
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        if (onHome) onHome();
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        if (onEnd) onEnd();
        return;
      }

      const visibleSlides = getVisibleSlides();

      if (e.key === 'ArrowDown') {
        e.preventDefault();

        if (filteredSlides.length === 0) return;

        let targetSlide;

        if (focusedIndex === null) {
          targetSlide = filteredSlides.find(s => s.index === currentIndex) || filteredSlides[0];
        } else {
          const visibleSlides = getVisibleSlides();
          const currentFocused = visibleSlides[focusedIndex];

          if (!currentFocused) return;

          const globalIdx = filteredSlides.findIndex(s => s.index === currentFocused.index);

          if (globalIdx < filteredSlides.length - 1) {
            targetSlide = filteredSlides[globalIdx + 1];
          } else {
            return;
          }
        }

        const pathParts = targetSlide.path.split('/');
        const targetFolder = pathParts.length > 3 ? pathParts[pathParts.length - 2] : 'Other';

        setExpandedFolders(prev => {
          const newExpanded = { ...prev, [targetFolder]: true };

          const newVisibleSlides = [];
          Object.entries(groupedSlides).forEach(([folder, slides]) => {
            if (newExpanded[folder]) {
              slides.forEach(slide => newVisibleSlides.push(slide));
            }
          });

          const newIdx = newVisibleSlides.findIndex(s => s.index === targetSlide.index);
          if (newIdx >= 0) {
            setFocusedIndex(newIdx);
          }

          return newExpanded;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();

        if (filteredSlides.length === 0) return;

        let targetSlide;

        if (focusedIndex === null) {
          targetSlide = filteredSlides.find(s => s.index === currentIndex) || filteredSlides[filteredSlides.length - 1];
        } else {
          const visibleSlides = getVisibleSlides();
          const currentFocused = visibleSlides[focusedIndex];

          if (!currentFocused) return;

          const globalIdx = filteredSlides.findIndex(s => s.index === currentFocused.index);

          if (globalIdx > 0) {
            targetSlide = filteredSlides[globalIdx - 1];
          } else {
            return;
          }
        }

        const pathParts = targetSlide.path.split('/');
        const targetFolder = pathParts.length > 3 ? pathParts[pathParts.length - 2] : 'Other';

        setExpandedFolders(prev => {
          const newExpanded = { ...prev, [targetFolder]: true };

          const newVisibleSlides = [];
          Object.entries(groupedSlides).forEach(([folder, slides]) => {
            if (newExpanded[folder]) {
              slides.forEach(slide => newVisibleSlides.push(slide));
            }
          });

          const newIdx = newVisibleSlides.findIndex(s => s.index === targetSlide.index);
          if (newIdx >= 0) {
            setFocusedIndex(newIdx);
          }

          return newExpanded;
        });
      } else if (e.key === 'Enter' && focusedIndex !== null) {
        e.preventDefault();
        const focusedSlide = visibleSlides[focusedIndex];
        if (focusedSlide) {
          originalSlideRef.current = null;
          onNavigate(focusedSlide.path);
          onClose();
        }
      }
    };

    const handleClickOutside = (e) => {
      if (e.target.classList.contains('slide-navigator-backdrop')) {
        // Return to original slide when clicking outside
        if (originalSlideRef.current) {
          onNavigate(originalSlideRef.current);
        }
        originalSlideRef.current = null;
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose, focusedIndex, expandedFolders, currentIndex, searchQuery]);

  useEffect(() => {
    // Auto-focus search input on mount
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Reset focused index when search changes
    setFocusedIndex(null);
  }, [searchQuery]);

  useEffect(() => {
    // Auto-expand all folders when searching
    if (searchQuery) {
      const allExpanded = {};
      Object.keys(groupedSlides).forEach(folder => {
        allExpanded[folder] = true;
      });
      setExpandedFolders(allExpanded);
    }
  }, [searchQuery]);

  const handleSlideClick = (path) => {
    // Commit the navigation on click
    originalSlideRef.current = null;
    onNavigate(path);
    onClose();
  };

  const handleSlideHover = (path) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      if (onPreview) {
        onPreview(path);
      }
    }, 1000);
  };

  const handleSlideLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleFirst = () => {
    if (SLIDES.length === 0) return;
    const firstSlide = SLIDES[0];
    const firstSlideIndex = 1;

    // Find and expand the folder containing the first slide
    const pathParts = firstSlide.path.split('/');
    const folder = pathParts.length > 3 ? pathParts[pathParts.length - 2] : 'Other';

    setExpandedFolders(prev => ({ ...prev, [folder]: true }));

    // Wait for folder to expand, then scroll and focus
    setTimeout(() => {
      const element = slideRefs.current[firstSlideIndex];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }, 100);
  };

  const handleLast = () => {
    if (SLIDES.length === 0) return;
    const lastSlide = SLIDES[SLIDES.length - 1];
    const lastSlideIndex = SLIDES.length;

    // Find and expand the folder containing the last slide
    const pathParts = lastSlide.path.split('/');
    const folder = pathParts.length > 3 ? pathParts[pathParts.length - 2] : 'Other';

    setExpandedFolders(prev => ({ ...prev, [folder]: true }));

    // Wait for folder to expand, then scroll and focus
    setTimeout(() => {
      const element = slideRefs.current[lastSlideIndex];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }, 100);
  };

  useEffect(() => {
    const initialExpanded = {};
    Object.entries(groupedSlides).forEach(([folder, slides]) => {
      const hasCurrentSlide = slides.some(slide => slide.index === currentIndex);
      initialExpanded[folder] = hasCurrentSlide;
    });
    setExpandedFolders(initialExpanded);

    setTimeout(() => {
      if (currentSlideRef.current) {
        currentSlideRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  }, [currentIndex]);

  useEffect(() => {
    if (focusedIndex !== null) {
      const visibleSlides = getVisibleSlides();
      const focusedSlide = visibleSlides[focusedIndex];
      if (focusedSlide && slideRefs.current[focusedSlide.index]) {
        slideRefs.current[focusedSlide.index].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [focusedIndex]);

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  return (
    <div
      className="slide-navigator-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .slide-item {
          transition: background-color 0.2s;
        }
        .slide-item:hover {
          background-color: rgba(99, 102, 241, 0.1);
        }
        .slide-item:focus {
          background-color: rgba(99, 102, 241, 0.1);
          outline: 2px solid rgba(99, 102, 241, 0.5);
          outline-offset: -2px;
        }
        .slide-item-current {
          background-color: rgba(99, 102, 241, 0.15);
          border-left: 3px solid #6366f1;
        }
      `}</style>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '500px',
          width: '90%',
          height: '500px',
          minHeight: '400px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            fontFamily: 'Nunito, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#374151'
          }}>
            Navigate to Slide
          </div>
          <div style={{ position: 'relative', flex: '0 0 200px' }}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '4px 24px 4px 8px',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                border: 'none',
                borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '0',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                style={{
                  position: 'absolute',
                  right: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  fontSize: '16px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>
        <div
          style={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <button
            onClick={handleFirst}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#6366f1',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              textDecoration: 'underline'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            First
          </button>
          <button
            disabled
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#6366f1',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {currentIndex}
          </button>
          <button
            onClick={handleLast}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#6366f1',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              textDecoration: 'underline'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(99, 102, 241, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Last
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div
          style={{
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filteredSlides.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: '#9ca3af'
              }}
            >
              No slides found
            </div>
          ) : (
            Object.entries(groupedSlides).map(([folder, slides]) => (
            <div key={folder}>
              <div
                onClick={() => toggleFolder(folder)}
                style={{
                  padding: '8px 16px',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#6366f1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '8px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
              >
                <span style={{ fontSize: '10px', transition: 'transform 0.2s', display: 'inline-block', transform: expandedFolders[folder] ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                  ▶
                </span>
                {folder} / {slides.length}
              </div>
              {expandedFolders[folder] && slides.map((slide) => {
                const isCurrent = slide.index === currentIndex;
                const visibleSlides = getVisibleSlides();
                const isFocused = focusedIndex !== null && visibleSlides[focusedIndex]?.index === slide.index;

                return (
                  <div
                    key={slide.path}
                    ref={(el) => {
                      slideRefs.current[slide.index] = el;
                      if (isCurrent) currentSlideRef.current = el;
                    }}
                    tabIndex={0}
                    className={`slide-item ${isCurrent ? 'slide-item-current' : ''}`}
                    onClick={() => handleSlideClick(slide.path)}
                    onMouseEnter={() => handleSlideHover(slide.path)}
                    onMouseLeave={handleSlideLeave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSlideClick(slide.path);
                      }
                    }}
                    style={{
                      padding: '12px 16px',
                      paddingLeft: '40px',
                      cursor: 'pointer',
                      fontFamily: 'Nunito, sans-serif',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      borderRadius: '0px',
                      margin: '4px 0',
                      outline: isFocused ? '2px solid #6366f1' : 'none',
                      outlineOffset: '-2px'
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: '#6366f1',
                        fontSize: '14px',
                        minWidth: '24px'
                      }}
                    >
                      {slide.index}
                    </span>
                    <span
                      style={{
                        color: '#374151',
                        fontSize: '15px',
                        fontWeight: isCurrent ? 600 : 400
                      }}
                    >
                      {slide.title}
                    </span>
                  </div>
                );
              })}
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}
