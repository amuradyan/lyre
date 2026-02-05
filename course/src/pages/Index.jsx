import { useState, useCallback } from 'react';
import LyreCodeblock from '../components/slide/codeblock/LyreCodeblock.jsx';
import Playlist from '../components/Playlist.jsx';
import pachelbelsCanonCode from '../assets/examples/pachelbels-canon-in-d.lyre?raw';

export default function Index() {
  const [code, setCode] = useState(pachelbelsCanonCode);
  const [selectedExample, setSelectedExample] = useState('pachelbels-canon-in-d');

  const handleSelectExample = useCallback((exampleId, exampleCode) => {
    setSelectedExample(exampleId);
    setCode(exampleCode);
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 -z-10"></div>
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-12">

          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="flex items-end justify-start gap-4">
              <img src="/lyre.png" alt="Lyre" className="w-48 h-auto" />
              <p className="text-l text-gray-600 pb-2">\ a music streaming lisp</p>
            </div>
          </div>

          {/* Language Reference Section */}
          <div className="mb-8 mt-28">
            <div className="bg-white/70 backdrop-blur rounded-sm shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Frequencies</h4>
                  <p className="text-gray-600">Specify pitches as frequencies in Hz. Examples: 261.63 /C4/, 440 /A4/, 523.25 /C5/.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Time</h4>
                  <p className="text-gray-600">All envelope parameters are in seconds. 0.5 = half second, 1.0 = one second.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Left Column - Code Editor and Examples */}
            <div className="lg:col-span-3">
              <div className="space-y-2">
                <Playlist
                  onSelectExample={handleSelectExample}
                  selectedExample={selectedExample}
                />

                <LyreCodeblock
                  code={code}
                  onChange={setCode}
                  showContainer={true}
                />
              </div>
            </div>
            {/* Right Column - Functions Reference */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur rounded-sm shadow-sm p-6">
                <div className="space-y-4 text-sm">
                  {/* Produce */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Produce</h3>
                    <ul className="space-y-3">
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(tone frequency)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">
                          <div className="mb-1">Generate infinite sine wave at given frequency in Hz</div>
                          <code className="font-mono text-purple-500 text-xs">(tone 440)</code>
                          <span className="text-gray-500 ml-2">- A4 sine wave</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Shape */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Shape</h3>
                    <ul className="space-y-3">
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(envelope source attack decay sustain release gate)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">
                          <div className="mb-1">Apply ADSR envelope. All times in seconds</div>
                          <code className="font-mono text-purple-500 text-xs">(envelope (tone 261.63) 0.01 1.0 0 0.5 0)</code>
                          <span className="text-gray-500 ml-2">- Plucked C4</span>
                        </div>
                      </li>
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(gain source level)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">
                          <div className="mb-1">Control volume, level from 0 to 1</div>
                          <code className="font-mono text-purple-500 text-xs">(gain (envelope ...) 0.5)</code>
                          <span className="text-gray-500 ml-2">- Half volume</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Compose */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Compose</h3>
                    <ul className="space-y-3">
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(sequence sound1 sound2 ...)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">
                          <div className="mb-1">Play sounds one after another</div>
                          <code className="font-mono text-purple-500 text-xs">(sequence noteC noteD noteE)</code>
                          <span className="text-gray-500 ml-2">- Melody</span>
                        </div>
                      </li>
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(harmony sound1 sound2 ...)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">
                          <div className="mb-1">Play sounds simultaneously</div>
                          <code className="font-mono text-purple-500 text-xs">(harmony noteC noteE noteG)</code>
                          <span className="text-gray-500 ml-2">- C major chord</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* Bottom Note */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              <strong>Note:</strong> For a deeper dive into language implementation, check out the{' '}
              <a href="#walkthrough" className="text-purple-600 hover:text-purple-800 underline" style={{ fontSize: '1.1rem' }}>
                walkthrough
              </a>{' '}
              /currently a mess and under construction 🚧/
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
