import { useState, useRef } from 'react';

export default function InlineAudioPlayer({ src }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <>
      <button
        onClick={togglePlay}
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-purple-400 hover:text-purple-500 transition-colors cursor-pointer relative top-[-1px]"
        title="Play audio"
        style={{ color: isPlaying ? 'rgb(192, 132, 252)' : 'rgb(192, 132, 252)' }}
      >
        {isPlaying ? '⏸︎' : '▶'}
      </button>
      <audio
        ref={audioRef}
        src={src}
        onEnded={handleEnded}
        preload="auto"
      />
    </>
  );
}
