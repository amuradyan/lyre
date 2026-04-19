import { useState, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { createAudioContext } from '../../../toolbox/audioPlayer.js';

export default function PlayableLyreJsCodeblock({ code, readOnly = false }) {
  const [userCode, setUserCode] = useState(code);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);

  useEffect(() => {
    setUserCode(code);
  }, [code]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
      if (!audioContextRef.current.lyreJsModulesLoaded) {
        audioContextRef.current.lyreJsModulesLoaded = false;
      }
    }
    return audioContextRef.current;
  };

  const initializeWorklet = async () => {
    const audioContext = getAudioContext();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    if (!workletNodeRef.current) {
      if (!audioContext.lyreJsModulesLoaded) {
        await audioContext.audioWorklet.addModule('/lyre-js-processor.js');
        audioContext.lyreJsModulesLoaded = true;
      }

      const workletNode = new AudioWorkletNode(audioContext, 'lyre-js-processor');

      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'ended') {
          setIsPlaying(false);
        } else if (event.data.type === 'error') {
          console.error('Lyre-JS worklet error:', event.data.error);
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
      workletNode.port.postMessage({ type: 'code', code: userCode });
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play Lyre-JS:', error);
    }
  };

  const stop = () => {
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ type: 'stop' });
    }
    setIsPlaying(false);
  };

  const handlePlayPause = useCallback(() => {
    if (isPlaying) stop();
    else playCode();
  }, [isPlaying, userCode]);

  useEffect(() => {
    try {
      new Function(userCode);
      setCanPlay(true);
    } catch {
      setCanPlay(false);
    }
  }, [userCode]);

  return (
    <div className="bg-white/70 backdrop-blur material-shadow overflow-hidden relative">
      <CodeEditor
        value={userCode}
        onChange={setUserCode}
        readOnly={readOnly}
        language="javascript"
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
