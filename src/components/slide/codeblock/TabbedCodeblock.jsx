import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { bundleTabs } from '../../../utils/moduleBundler.js';
import { createAudioContext } from '../../../utils/audioPlayer.js';
import { saveCodeBlock, loadCodeBlock, saveHintState, loadHintState } from '../../../utils/slideStorage.js';
import { mergeHintsIntoEdited } from '../../../utils/hintMerger.js';

function stripHints(code) {
  return code
    .replace(/^\s*\/\*\s*#![\s\S]*?\*\/\s*$/gm, '')
    .replace(/\/\*\s*#![\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !/^\s*\/\/\s*#!/.test(line))
    .map(line => line.replace(/\/\/\s*#!.*$/, '').trimEnd())
    .filter(line => line !== '')
    .join('\n');
}

export default function TabbedCodeblock({ blocks, savedCodes, groupPlayable, slideId }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [hintsVisible, setHintsVisible] = useState(() => loadHintState(slideId));

  const [editedCode, setEditedCode] = useState(() => {
    const initialHintsVisible = loadHintState(slideId);

    return blocks.map((block, index) => {
      const saved = savedCodes?.[index];
      if (saved) return saved;

      return initialHintsVisible ? null : stripHints(block.code);
    });
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const [tabErrors, setTabErrors] = useState({});
  const [navigateToSymbol, setNavigateToSymbol] = useState(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);

  const hasHints = useMemo(() => {
    return blocks.some(block => block.hints && block.hints.length > 0);
  }, [blocks]);

  const displayCode = useMemo(() => {
    return blocks.map((block, index) => {
      return editedCode[index] != null ? editedCode[index] : block.code;
    });
  }, [blocks, editedCode]);

  const playableTabIndex = blocks.findIndex(block => block.playable);
  const hasPlayableTab = playableTabIndex !== -1 || groupPlayable;

  const bundledCode = useMemo(() => {
    if (!hasPlayableTab) return null;

    const tabsWithCurrentCode = blocks.map((block, index) => ({
      ...block,
      code: displayCode[index]
    }));

    return bundleTabs(tabsWithCurrentCode);
  }, [displayCode, blocks, hasPlayableTab]);

  const activeBlock = blocks[activeTabIndex];

  const handleCodeChange = (newCode) => {
    setEditedCode(prev => {
      const updated = [...prev];
      updated[activeTabIndex] = newCode;
      return updated;
    });

    if (slideId) {
      const originalCode = blocks[activeTabIndex].code;
      saveCodeBlock(slideId, originalCode, newCode);
    }
  };

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  };

  const initializeWorklet = async () => {
    const audioContext = getAudioContext();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    if (!workletNodeRef.current) {
      await audioContext.audioWorklet.addModule('/js-generator-processor.js');
      const workletNode = new AudioWorkletNode(audioContext, 'js-generator-processor');

      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'ended') {
          setIsPlaying(false);
        } else if (event.data.type === 'error') {
          console.error('AudioWorklet error:', event.data.error);
          setIsPlaying(false);
        }
      };

      workletNode.connect(audioContext.destination);
      workletNodeRef.current = workletNode;
    }

    return workletNodeRef.current;
  };

  const playCode = async () => {
    try {
      const workletNode = await initializeWorklet();

      workletNode.port.postMessage({
        type: 'code',
        code: bundledCode
      });

      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play JavaScript generator:', error);
    }
  };

  const stop = () => {
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ type: 'stop' });
    }
    setIsPlaying(false);
  };

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      playCode();
    }
  }, [isPlaying, bundledCode]);

  const handleCtrlClick = useCallback(({ lineContent, word }) => {
    console.log('Ctrl+click:', { lineContent, word });
    const importMatch = lineContent.match(/const\s*\{([^}]*)\}\s*=\s*(\w+)/);
    console.log('Import match:', importMatch);

    if (importMatch && word) {
      const imports = importMatch[1].split(',').map(s => s.trim());
      const sourceTabName = importMatch[2];
      console.log('Imports:', imports, 'Source tab:', sourceTabName, 'Word:', word);

      if (imports.includes(word)) {
        const targetIndex = blocks.findIndex(b =>
          b.filename === sourceTabName
        );
        console.log('Target index:', targetIndex);

        if (targetIndex !== -1) {
          console.log('Navigating to symbol:', word);
          setNavigateToSymbol(word);
          setActiveTabIndex(targetIndex);
        }
      }
    }
  }, [blocks]);

  const handleHintToggle = () => {
    const newHintsVisible = !hintsVisible;

    if (newHintsVisible) {
      const hasEdits = editedCode.some(code => code !== null);

      if (hasEdits) {
        const newEditedCode = [...editedCode];

        for (let index = 0; index < editedCode.length; index++) {
          const edited = editedCode[index];
          if (edited === null) continue;

          const original = blocks[index].code;
          const strippedOriginal = stripHints(original);

          if (edited === strippedOriginal || edited === original) {
            newEditedCode[index] = null;
            continue;
          }

          const result = mergeHintsIntoEdited(original, edited);

          if (!result.success) {
            hasMergeFailure = true;
            const shouldReset = window.confirm(
              'Code structure changed. Reset to original with hints?'
            );

            if (shouldReset) {
              newEditedCode[index] = null;
            } else {
              return;
            }
          } else {
            newEditedCode[index] = result.code;
          }
        }

        setEditedCode(newEditedCode);
      }
    } else {
      const newEditedCode = blocks.map((block, index) => {
        const current = editedCode[index] || block.code;
        return stripHints(current);
      });
      setEditedCode(newEditedCode);
    }

    setHintsVisible(newHintsVisible);
    saveHintState(slideId, newHintsVisible);
  };

  useEffect(() => {
    if (navigateToSymbol) {
      const timer = setTimeout(() => setNavigateToSymbol(null), 100);
      return () => clearTimeout(timer);
    }
  }, [navigateToSymbol, activeTabIndex]);

  useEffect(() => {
    if (!hasPlayableTab) return;

    const checkCompilation = () => {
      try {
        new Function(bundledCode);
        setCanPlay(true);
      } catch (error) {
        setCanPlay(false);
      }
    };

    checkCompilation();
  }, [bundledCode, hasPlayableTab]);

  useEffect(() => {
    const errors = {};

    blocks.forEach((_, index) => {
      try {
        new Function(displayCode[index]);
      } catch {
        errors[index] = true;
      }
    });

    setTabErrors(errors);
  }, [displayCode, blocks]);

  return (
    <div style={{ marginTop: '2vh' }}>
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '0'
      }}>
        {blocks.map((block, index) => {
          const tabName = block.filename || `tab${index + 1}`;
          const isActive = index === activeTabIndex;
          const hasError = tabErrors[index];

          return (
            <button
              key={index}
              onClick={() => setActiveTabIndex(index)}
              style={{
                padding: '8px 16px',
                background: isActive ? '#f6f8fa' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                color: isActive ? '#1f2937' : '#6b7280',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: isActive ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {tabName}
              {hasError && <span style={{ color: '#dc2626', fontSize: '14px' }}>✗</span>}
            </button>
          );
        })}
      </div>
      <div className="bg-white/70 backdrop-blur shadow-sm overflow-hidden relative">
        <CodeEditor
          value={displayCode[activeTabIndex]}
          onChange={handleCodeChange}
          readOnly={false}
          language={activeBlock.language || 'javascript'}
          onCtrlClick={handleCtrlClick}
          navigateToSymbol={navigateToSymbol}
        />
        {hasHints && (
          <button
            onClick={handleHintToggle}
            className="absolute flex items-center justify-center w-6 h-6 backdrop-blur text-white transition-all duration-200"
            style={{
              top: '8px',
              right: hasPlayableTab ? '40px' : '8px',
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
        {hasPlayableTab && (
          <button
            onClick={handlePlayPause}
            disabled={!canPlay}
            className="absolute flex items-center justify-center w-6 h-6 backdrop-blur text-white transition-all duration-200"
            style={{
              top: '8px',
              right: '8px',
              zIndex: 9999,
              backgroundColor: canPlay ? '#B187D8' : '#9ca3af',
              cursor: canPlay ? 'pointer' : 'not-allowed',
              opacity: canPlay ? 1 : 0.5
            }}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
