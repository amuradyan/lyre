import { useState, useCallback, useRef, useEffect } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { createAudioContext } from '../../../utils/audioPlayer.js';

const isIOSSafari = () => {
  const userAgent = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  return isIOS && isSafari;
};

export default function LyreCodeblock({
  code,
  onChange,
  readOnly = false,
  showContainer = true
}) {
  const [userCode, setUserCode] = useState(code);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(!isIOSSafari());
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);

  useEffect(() => {
    setUserCode(code);
  }, [code]);

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
      await audioContext.audioWorklet.addModule('/audio-worklet-processor.js');
      const workletNode = new AudioWorkletNode(audioContext, 'lyre-processor');

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

  const enableAudio = async () => {
    try {
      const audioContext = getAudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      setAudioEnabled(true);
    } catch (error) {
      console.error('Failed to enable audio:', error);
    }
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

  const speakerIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );

  const playIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M8 5v14l11-7z" />
    </svg>
  );

  const pauseIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );

  const playButton = (
    <button
      onClick={audioEnabled ? handlePlayPause : enableAudio}
      className="absolute flex items-center justify-center w-6 h-6 backdrop-blur text-white hover:opacity-80 transition-all duration-200"
      style={{ top: '8px', right: '8px', zIndex: 9999, backgroundColor: '#B187D8' }}
    >
      {!audioEnabled ? speakerIcon : (isPlaying ? pauseIcon : playIcon)}
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
      <div className="bg-white/70 backdrop-blur shadow-sm overflow-hidden relative">
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
