import { useEffect, useState, useRef } from 'react';
import { SLIDES } from '../../config/slides.js';

export default function SlideNavigator({ currentIndex, onNavigate, onClose }) {
  const [expandedFolders, setExpandedFolders] = useState({});
  const currentSlideRef = useRef(null);
  const slideRefs = useRef({});
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (e.target.classList.contains('slide-navigator-backdrop')) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const handleSlideClick = (path) => {
    onNavigate(path);
    onClose();
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

  const groupedSlides = SLIDES.reduce((groups, slide, idx) => {
    const pathParts = slide.path.split('/');
    const folder = pathParts.length > 3 ? pathParts[pathParts.length - 2] : 'Other';

    if (!groups[folder]) {
      groups[folder] = [];
    }

    groups[folder].push({ ...slide, index: idx + 1 });
    return groups;
  }, {});

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
            fontSize: '18px',
            fontWeight: 700,
            color: '#374151'
          }}
        >
          Navigate to Slide
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
          {Object.entries(groupedSlides).map(([folder, slides]) => (
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
                {folder}
              </div>
              {expandedFolders[folder] && slides.map((slide) => {
                const isCurrent = slide.index === currentIndex;

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
                      margin: '4px 0'
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
          ))}
        </div>
      </div>
    </div>
  );
}
