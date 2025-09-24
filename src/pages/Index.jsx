import { useState, useRef, useCallback } from 'react';
import CodeEditor from '../components/slide/codeblock/CodeEditor.jsx';
import { createAudioContext } from '../utils/audioPlayer.js';

const TWINKLE_TWINKLE = `(sequence
  (silence 500)

  ;  Twin-            kle,          twin-         kle,
  (tone C4 500) (tone C4 500) (tone G4 500) (tone G4 500)
  ;  Lit-             tle           star
  (tone A4 500) (tone A4 500) (tone G4 1000)
  ;  How              I             won-          der
  (tone F4 500) (tone F4 500) (tone E4 500) (tone E4 500)
  ;  what             you           are
  (tone D4 500) (tone D4 500) (tone C4 1000)

  (silence 500))`;

export default function Index() {
  const [code, setCode] = useState(TWINKLE_TWINKLE);
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
      await audioContext.audioWorklet.addModule('/src/audio/lyre-worklet.js');
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
        code: code
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
  }, [isPlaying, code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Lyre Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🪉 <span className="text-purple-600">Lyre</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A musical programming language that turns code into sound.
          </p>
        </div>

        {/* Code Block with Play Button */}
        <div className="mb-1">
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm overflow-hidden relative">
            <button
              onClick={handlePlayPause}
              className="absolute flex items-center justify-center w-10 h-10 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 rounded-none"
              style={{ top: '8px', right: '8px', zIndex: 9999, borderRadius: '0' }}
            >
              {isPlaying ? (
                <span className="text-lg">⏸</span>
              ) : (
                <span className="text-lg">▶</span>
              )}
            </button>
            <CodeEditor
              value={code}
              onChange={setCode}
              language="scheme"
            />
          </div>
        </div>

        {/* Functions */}
        <div className="text-sm text-left font-rounded">
          <h4 className="font-medium text-gray-900">Functions</h4>
          <p className="text-gray-600 mb-3 text-xs">
            Time is in milliseconds (1000ms = 1 second)<br />
            Notes range from C1 to B6 (use sharps like C#4 or flats like Bb4)
          </p>
          <ul className="space-y-2">
            <li><code className="font-mono text-gray-800">(tone C4 500)</code> - Play a single note (pitch + duration in milliseconds). Use notes like C4, D#5, F3</li>
            <li><code className="font-mono text-gray-800">(sequence a b c)</code> - Play sounds one after another in order</li>
            <li><code className="font-mono text-gray-800">(parallel a b c)</code> - Play multiple sounds at the same time (harmony/chords)</li>
            <li><code className="font-mono text-gray-800">(repeat 3 melody)</code> - Repeat any sound or phrase multiple times</li>
            <li><code className="font-mono text-gray-800">(silence 500)</code> - Add silence/rest for a duration in milliseconds</li>
          </ul>
          <p className="text-gray-500 text-xs mt-4">
            <strong>Note:</strong> For a deeper dive into language implementation, check out the{' '}
            <a href="#walkthrough" className="text-purple-600 hover:text-purple-800 underline">
              walkthrough
            </a>{' '}
            (currently a mess and under construction 🚧)
          </p>
        </div>
      </div>
    </div>
  );
}
