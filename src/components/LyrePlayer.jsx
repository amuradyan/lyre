import { useState, useRef, useCallback } from 'react';
import { createAudioContext } from '../utils/audioPlayer.js';
import { runStreaming as run } from '../lyre/evaluator.js';

export default function LyrePlayer({ expression = "(harmony (tone C4 200) (tone B4 200) (tone A4 400))" }) {
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

  const play = async () => {
    setIsLoading(true);
    try {
      const workletNode = await initializeWorklet();

      const samples = run(expression);

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
      play();
    }
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg mb-6">
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <span className="text-lg">⏸</span>
        ) : (
          <span className="text-lg">▶</span>
        )}
      </button>
      <div className="text-sm text-gray-600">
        {isLoading ? 'Evaluating Lyre...' : `🪈 ${expression}`}
      </div>
    </div>
  );
}
