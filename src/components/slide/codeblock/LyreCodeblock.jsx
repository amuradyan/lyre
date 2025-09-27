import { useState, useCallback, useRef } from 'react';
import CodeEditor from './CodeEditor.jsx';
import { runStreaming as run } from '../../../lyre/evaluator.js';
import { createAudioContext } from '../../../utils/audioPlayer.js';

export default function LyreCodeblock({ code, readOnly = false }) {
  const [userCode, setUserCode] = useState(code);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        }
      };

      workletNode.connect(audioContext.destination);
      workletNodeRef.current = workletNode;
    }

    return workletNodeRef.current;
  };

  const playLyreCode = async () => {
    setIsLoading(true);
    try {
      const workletNode = await initializeWorklet();
      const samples = run(userCode);

      workletNode.port.postMessage({
        type: 'samples',
        samples: samples
      });

      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play Lyre expression:', error);
    } finally {
      setIsLoading(false);
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
      playLyreCode();
    }
  }, [isPlaying, userCode]);

  const handleCodeChange = (newCode) => {
    setUserCode(newCode);
  };

  return (
    <div style={{ marginTop: '2vh' }}>
      <CodeEditor
        value={userCode}
        onChange={handleCodeChange}
        readOnly={readOnly}
        language="scheme"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <>
              <span>⏸</span>
              <span>Stop</span>
            </>
          ) : (
            <>
              <span>▶</span>
              <span>Run Lyre</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
