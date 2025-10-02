import { useState, useCallback, useRef } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { createAudioContext } from '../../../utils/audioPlayer.js';

export default function LyreCodeblock({
  code,
  onChange,
  readOnly = false,
  showContainer = true,
  buttonPosition = 'bottom' // 'bottom' or 'absolute'
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
      className={buttonPosition === 'absolute' 
        ? "absolute flex items-center justify-center w-6 h-6 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 rounded-sm"
        : "flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-sm hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
      }
      style={buttonPosition === 'absolute' ? { top: '8px', right: '8px', zIndex: 9999 } : {}}
    >
      {buttonPosition === 'absolute' ? (
        <span className="text-sm">{isPlaying ? '⏸' : '▶'}</span>
      ) : (
        <>
          <span className="text-sm">{isPlaying ? '⏸' : '▶'}</span>
          {isPlaying ? 'Stop' : 'Play'}
        </>
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
      {buttonPosition === 'absolute' && playButton}
    </>
  );

  if (showContainer) {
    return (
      <div className="bg-white/70 backdrop-blur rounded-sm shadow-sm overflow-hidden relative">
        {editorContent}
        {buttonPosition === 'bottom' && (
          <div className="flex justify-end mt-2 p-4">
            {playButton}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {editorContent}
      {buttonPosition === 'bottom' && (
        <div className="flex justify-end mt-2">
          {playButton}
        </div>
      )}
    </div>
  );
}