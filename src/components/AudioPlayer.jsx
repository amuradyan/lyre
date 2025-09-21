import { useState, useRef, useCallback } from 'react';
import { createAudioContext, loadAndConvertSamples, playAudioBuffer, stopAudioSource } from '../utils/audioPlayer.js';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const audioBufferRef = useRef(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  };

  const loadSamples = async () => {
    setIsLoading(true);
    try {
      const audioContext = getAudioContext();
      const audioBuffer = await loadAndConvertSamples(audioContext);
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
      const audioContext = getAudioContext();

      let audioBuffer = audioBufferRef.current;
      if (!audioBuffer) {
        audioBuffer = await loadSamples();
      }

      const source = await playAudioBuffer(audioContext, audioBuffer, () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      });

      sourceNodeRef.current = source;
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    }
  };

  const stop = () => {
    stopAudioSource(sourceNodeRef.current);
    sourceNodeRef.current = null;
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
