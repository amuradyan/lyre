import { useState, useRef, useCallback } from 'react';
import { createAudioContext } from '../utils/audioPlayer.js';

export default function StreamingAudioPlayer() {
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

      // Generate sample data for demo (C4 then A4)
      const sampleRate = 44100;
      const duration = 500; // 1.5 seconds each note
      const samplesPerNote = Math.floor(sampleRate * (duration / 1000));

      // C4 samples
      const c4Samples = [];
      for (let i = 0; i < samplesPerNote; i++) {
        const t = i / sampleRate;
        c4Samples.push(Math.sin(2 * Math.PI * 261.63 * t) * 0.3);
      }

      // A4 samples
      const a4Samples = [];
      for (let i = 0; i < samplesPerNote; i++) {
        const t = i / sampleRate;
        a4Samples.push(Math.sin(2 * Math.PI * 440 * t) * 0.3);
      }

      // Send combined samples
      const allSamples = [...c4Samples, ...a4Samples];
      workletNode.port.postMessage({
        type: 'samples',
        samples: allSamples
      });


      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start streaming audio:', error);
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
    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg mb-6">
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 transition-colors"
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
        {isLoading ? 'Loading streaming audio...' : 'Streaming Audio Demo (C4 for 1 second)'}
      </div>
    </div>
  );
}
