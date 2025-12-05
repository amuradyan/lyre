import { useState, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { createAudioContext } from '../../../utils/audioPlayer.js';

export default function PlayableJsCodeblock({ code, readOnly = false, slideId, blockIndex }) {
  const getStorageKey = () => slideId && blockIndex !== undefined ? `playable-${slideId}-${blockIndex}` : null;

  const [userCode, setUserCode] = useState(() => {
    const storageKey = slideId && blockIndex !== undefined ? `playable-${slideId}-${blockIndex}` : null;
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      return saved || code;
    }
    return code;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);

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
        code: userCode
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
  }, [isPlaying, userCode]);

  const handleCodeChange = (newCode) => {
    setUserCode(newCode);
  };

  useEffect(() => {
    const checkCompilation = () => {
      try {
        new Function(userCode);
        setCanPlay(true);

        const storageKey = getStorageKey();
        if (storageKey) {
          localStorage.setItem(storageKey, userCode);
        }
      } catch (error) {
        setCanPlay(false);
      }
    };

    checkCompilation();
  }, [userCode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'p' && canPlay) {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePlayPause, canPlay]);

  return (
    <div className="bg-white/70 backdrop-blur shadow-sm overflow-hidden relative">
      <CodeEditor
        value={userCode}
        onChange={handleCodeChange}
        readOnly={readOnly}
      />
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
    </div>
  );
}
