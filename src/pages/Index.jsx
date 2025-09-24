import { useState, useRef, useCallback } from 'react';
import CodeEditor from '../components/slide/codeblock/CodeEditor.jsx';
import { run } from '../../lyre/evaluator.js';
import { createAudioContext } from '../utils/audioPlayer.js';

const TWINKLE_TWINKLE = `(sequence
  (tone C4 500) (tone C4 500) (tone G4 500) (tone G4 500)
  (tone A4 500) (tone A4 500) (tone G4 1000)
  (tone F4 500) (tone F4 500) (tone E4 500) (tone E4 500)
  (tone D4 500) (tone D4 500) (tone C4 1000))`;

export default function Index() {
  const [code, setCode] = useState(TWINKLE_TWINKLE);
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

  const playCode = async () => {
    setIsLoading(true);
    try {
      const workletNode = await initializeWorklet();
      const samples = run(code);
      
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
      playCode();
    }
  }, [isPlaying, code]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            🪈 <span className="text-purple-600">Lyre</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A musical programming language that turns code into sound. 
            Write expressions, create melodies, and hear your algorithms sing.
          </p>
        </div>

        {/* Functions Reference */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Functions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-2">tone</h3>
              <code className="text-sm text-gray-600 block mb-2">(tone C4 500)</code>
              <p className="text-sm text-gray-600">Play a single note for a duration</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">sequence</h3>
              <code className="text-sm text-gray-600 block mb-2">(sequence ...)</code>
              <p className="text-sm text-gray-600">Play sounds one after another</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-bold text-green-800 mb-2">parallel</h3>
              <code className="text-sm text-gray-600 block mb-2">(parallel ...)</code>
              <p className="text-sm text-gray-600">Play sounds at the same time</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-bold text-orange-800 mb-2">repeat</h3>
              <code className="text-sm text-gray-600 block mb-2">(repeat 3 ...)</code>
              <p className="text-sm text-gray-600">Repeat a musical phrase</p>
            </div>
          </div>
        </div>

        {/* Interactive Playground */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Interactive Playground</h2>
            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="flex items-center gap-3 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-lg font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : isPlaying ? (
                <>
                  <span className="text-xl">⏸</span>
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <span className="text-xl">▶</span>
                  <span>Play</span>
                </>
              )}
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 mb-4">
              Try editing the code below - it's currently set to play "Twinkle Twinkle Little Star"
            </p>
            <div style={{ height: '300px' }}>
              <CodeEditor
                value={code}
                onChange={setCode}
                language="scheme"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}