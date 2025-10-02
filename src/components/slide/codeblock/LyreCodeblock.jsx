import { useState, useCallback, useRef } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { createAudioContext } from '../../../utils/audioPlayer.js';

export default function LyreCodeblock({
  code,
  onChange,
  readOnly = false,
  showContainer = true
}) {
  const [userCode, setUserCode] = useState(code);
  const [isPlaying, setIsPlaying] = useState(false);
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
      className="absolute flex items-center justify-center w-6 h-6 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
      style={{ top: '8px', right: '8px', zIndex: 9999 }}
    >
      <span className="text-sm">{isPlaying ? '⏸' : '▶'}</span>
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