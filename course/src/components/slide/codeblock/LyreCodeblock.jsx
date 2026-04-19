import { useState, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { createAudioContext } from '../../../toolbox/audioPlayer.js';

export default function LyreCodeblock({
  code,
  onChange,
  readOnly = false,
  showContainer = true,
  version = null
}) {
  const [userCode, setUserCode] = useState(code);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);

  useEffect(() => {
    setUserCode(code);
  }, [code]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
      if (!audioContextRef.current.lyreModulesLoaded) {
        audioContextRef.current.lyreModulesLoaded = new Set();
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
      const workletUrl = version
        ? `/lyre-versions/${version}/worklet.js`
        : '/audio-worklet-processor.js';

      const processorName = version
        ? `lyre-processor-${version.replace(/\./g, '-')}`
        : 'lyre-processor';

      if (!audioContext.lyreModulesLoaded.has(workletUrl)) {
        try {
          await audioContext.audioWorklet.addModule(workletUrl);
          audioContext.lyreModulesLoaded.add(workletUrl);
        } catch (error) {
          console.error('Failed to load worklet module:', error);
          throw error;
        }
      }

      const workletNode = new AudioWorkletNode(audioContext, processorName);

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
      console.error('Failed to play Lyre expression:', error);
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
    if (onChange) {
      onChange(newCode);
    }
  };

  const playButton = (
    <button
      onClick={handlePlayPause}
      className="absolute flex items-center justify-center w-6 h-6 backdrop-blur text-white hover:opacity-80 transition-all duration-200"
      style={{ top: '8px', right: '8px', zIndex: 9999, backgroundColor: '#B187D8' }}
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
  );

  const editorContent = (
    <>
      <CodeEditor
        value={userCode}
        onChange={handleCodeChange}
        readOnly={readOnly}
        language="scheme"
      />
      {playButton}
    </>
  );

  if (showContainer) {
    return (
      <div className="bg-white/70 backdrop-blur material-shadow overflow-hidden relative">
        {editorContent}
      </div>
    );
  }

  return (
    <div className="relative">
      {editorContent}
    </div>
  );
}
