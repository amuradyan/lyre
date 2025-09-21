import { useState, useRef, useCallback } from 'react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const audioBufferRef = useRef(null);

  const createAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const loadAndConvertSamples = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/samples.json');
      const samples = await response.json();

      const audioContext = createAudioContext();
      const sampleRate = 44100;
      const audioBuffer = audioContext.createBuffer(1, samples.length, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < samples.length; i++) {
        channelData[i] = samples[i] / 32768.0;
      }

      audioBufferRef.current = audioBuffer;
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load samples:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const play = async () => {
    try {
      const audioContext = createAudioContext();

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      let audioBuffer = audioBufferRef.current;
      if (!audioBuffer) {
        audioBuffer = await loadAndConvertSamples();
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };

      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
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
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
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
        {isLoading ? 'Loading audio...' : 'Play sample audio'}
      </div>
    </div>
  );
}
