import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { bundleTabs } from '../../../utils/moduleBundler.js';
import { createAudioContext } from '../../../utils/audioPlayer.js';

export default function TabbedCodeblock({ blocks, groupPlayable }) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabCode, setTabCode] = useState(
    blocks.map(block => block.code)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);

  const playableTabIndex = blocks.findIndex(block => block.playable);
  const hasPlayableTab = playableTabIndex !== -1 || groupPlayable;

  const bundledCode = useMemo(() => {
    if (!hasPlayableTab) return null;

    const tabsWithCurrentCode = blocks.map((block, index) => ({
      ...block,
      code: tabCode[index]
    }));

    return bundleTabs(tabsWithCurrentCode);
  }, [tabCode, blocks, hasPlayableTab]);

  const activeBlock = blocks[activeTabIndex];

  const handleCodeChange = (newCode) => {
    setTabCode(prev => {
      const updated = [...prev];
      updated[activeTabIndex] = newCode;
      return updated;
    });
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
                fontWeight: isActive ? 600 : 400
              }}
            >
              {tabName}
            </button>
          );
        })}
      </div>
      <div className="bg-white/70 backdrop-blur shadow-sm overflow-hidden relative">
        <CodeEditor
          value={tabCode[activeTabIndex]}
          onChange={handleCodeChange}
          readOnly={false}
          language={activeBlock.language || 'javascript'}
        />
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
