import { useEffect } from 'react';

export default function KeyboardShortcutsModal({ onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (e.target.classList.contains('shortcuts-modal-backdrop')) {
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

  return (
    <div
      className="shortcuts-modal-backdrop"
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
        .shortcut-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          font-family: 'Nunito', sans-serif;
        }
        .shortcut-key {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #6366f1;
          background: rgba(99, 102, 241, 0.1);
          padding: 4px 8px;
          border-radius: 3px;
          min-width: 80px;
          text-align: center;
        }
        .shortcut-desc {
          font-size: 14px;
          color: #374151;
        }
        .element-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 8px 4px;
          font-family: 'Nunito', sans-serif;
        }
        .element-icon {
          min-width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .element-desc {
          font-size: 12px;
          color: #374151;
          text-align: center;
          line-height: 1.3;
        }
      `}</style>
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '0',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxWidth: '800px',
          width: '90%',
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
          Keyboard Shortcuts
        </div>

        <div style={{ padding: '20px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
          <div
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '13px',
              fontWeight: 700,
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}
          >
            Global Navigation
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div className="shortcut-row">
              <div className="shortcut-key">← →</div>
              <div className="shortcut-desc">Previous / Next slide</div>
            </div>

            <div className="shortcut-row">
              <div className="shortcut-key">Home / End</div>
              <div className="shortcut-desc">First / Last slide</div>
            </div>

            <div className="shortcut-row">
              <div className="shortcut-key">/</div>
              <div className="shortcut-desc">Toggle slide navigator</div>
            </div>

            <div className="shortcut-row">
              <div className="shortcut-key">.</div>
              <div className="shortcut-desc">Show this help</div>
            </div>
          </div>

          <div
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '13px',
              fontWeight: 700,
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}
          >
            Slide Navigator
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div className="shortcut-row">
              <div className="shortcut-key">Type</div>
              <div className="shortcut-desc">Search with fuzzy matching</div>
            </div>

            <div className="shortcut-row">
              <div className="shortcut-key">↑ ↓</div>
              <div className="shortcut-desc">Navigate filtered slides</div>
            </div>

            <div className="shortcut-row">
              <div className="shortcut-key">Enter</div>
              <div className="shortcut-desc">Go to selected slide</div>
            </div>

            <div className="shortcut-row">
              <div className="shortcut-key">Esc</div>
              <div className="shortcut-desc">Clear search / Close</div>
            </div>

            <div className="shortcut-row">
              <div className="shortcut-key">Home / End</div>
              <div className="shortcut-desc">Jump to first/last</div>
            </div>

            <div className="shortcut-row">
              <div className="shortcut-key">Click</div>
              <div className="shortcut-desc">Select slide</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 20px 20px 20px' }}>
          <div
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '13px',
              fontWeight: 700,
              color: '#6366f1',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '12px'
            }}
          >
            Interactive Elements
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
            <div className="element-row">
              <div className="element-icon">
                <svg viewBox="0 0 24 24" fill="#6366f1" style={{ width: '20px', height: '20px' }}>
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </div>
              <div className="element-desc">Show/hide hints</div>
            </div>

            <div className="element-row">
              <div className="element-icon">
                <svg viewBox="0 0 24 24" fill="#B187D8" style={{ width: '20px', height: '20px' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="element-desc">Run/Play</div>
            </div>

            <div className="element-row">
              <div className="element-icon">
                <div style={{ display: 'flex', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2ea043' }}></div>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f85149' }}></div>
                </div>
              </div>
              <div className="element-desc">Test results</div>
            </div>

            <div className="element-row">
              <div className="element-icon">
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', fontWeight: 600, color: '#9ca3af' }}>1/42</span>
              </div>
              <div className="element-desc">Browse slides</div>
            </div>

            <div className="element-row">
              <div className="element-icon">
                <img src="/lyre-logo.png" alt="Logo" style={{ width: '18px', height: 'auto' }} />
              </div>
              <div className="element-desc">Home</div>
            </div>

            <div className="element-row">
              <div className="element-icon">
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '18px', fontWeight: 600, color: '#6366f1' }}>.</span>
              </div>
              <div className="element-desc">Help button</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
