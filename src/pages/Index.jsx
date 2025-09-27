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

        {/* Title Section */}
        <div className="text-center mb-8">
          <div className="flex items-end justify-start gap-4">
            <img src="/lyre.png" alt="Lyre" className="w-48 h-auto" />
            <p className="text-l text-gray-600 pb-2">/ a musical language</p>
          </div>
        </div>

        {/* Language Reference Section */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur rounded-sm shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-600">Use standard note notation like C4, D#5, Fb3. Sharps (#) and flats (b) are supported.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Range</h4>
                <p className="text-gray-600">Notes range from C1 (lowest) to C6 (highest).</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Time</h4>
                <p className="text-gray-600">All durations are in milliseconds. 1000ms = 1 second.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left Column - Code Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur rounded-sm shadow-sm overflow-hidden relative">
              <button
                onClick={handlePlayPause}
                className="absolute flex items-center justify-center w-6 h-6 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 rounded-sm"
                style={{ top: '8px', right: '8px', zIndex: 9999 }}
              >
                {isPlaying ? (
                  <span className="text-sm">⏸</span>
                ) : (
                  <span className="text-sm">▶</span>
                )}
              </button>
              <CodeEditor
                value={code}
                onChange={setCode}
                language="scheme"
              />
            </div>
          </div>

          {/* Right Column - Functions Reference */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur rounded-sm shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Functions</h3>

              <ul className="space-y-3 text-sm">
                <li>
                  <code className="font-mono text-purple-600 text-xs">(tone C4 500)</code>
                  <div className="text-gray-600 mt-1">Play a single note with pitch and duration</div>
                </li>
                <li>
                  <code className="font-mono text-purple-600 text-xs">(sequence ...)</code>
                  <div className="text-gray-600 mt-1">Play sounds one after another in order</div>
                </li>
                <li>
                  <code className="font-mono text-purple-600 text-xs">(parallel ...)</code>
                  <div className="text-gray-600 mt-1">Play multiple sounds simultaneously (chords)</div>
                </li>
                <li>
                  <code className="font-mono text-purple-600 text-xs">(repeat 3 melody)</code>
                  <div className="text-gray-600 mt-1">Repeat any sound or phrase multiple times</div>
                </li>
                <li>
                  <code className="font-mono text-purple-600 text-xs">(silence 500)</code>
                  <div className="text-gray-600 mt-1">Add silence/rest for specified duration</div>
                </li>
              </ul>

            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            <strong>Note:</strong> For a deeper dive into language implementation, check out the{' '}
            <a href="#walkthrough" className="text-purple-600 hover:text-purple-800 underline">
              walkthrough
            </a>{' '}
            (currently under construction 🚧)
          </p>
        </div>
      </div>
    </div>
  );
}
