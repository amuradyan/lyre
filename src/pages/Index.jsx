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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-600">Use standard note notation like C4, D#5, Fb3. Sharps /#/ and flats /b/ are supported.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Range</h4>
                  <p className="text-gray-600">Notes range from C1 /lowest/ to C6 /highest/.</p>
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
                  {/* Produce sounds */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Produce sounds</h3>
                    <ul className="space-y-2">
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(tone C4 500)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">Play a single pitch for a certain time</div>
                      </li>
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(silence 500)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">Add silence/rest for specified duration</div>
                      </li>
                    </ul>
                  </div>

                  {/* Combine sounds */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Combine sounds</h3>
                    <ul className="space-y-2">
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(sequence (tone ...) (tone ...) ...)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">Play sounds one after another in order</div>
                      </li>
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(harmony (tone ...) (tone ...) ...)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">Play multiple sounds simultaneously</div>
                      </li>
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(repeat 3 (sequence ...))</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">Repeat any sound or phrase multiple times /trice in this case/.</div>
                      </li>
                    </ul>
                  </div>

                  {/* Name values */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">Name values</h3>
                    <ul className="space-y-2">
                      <li className="text-left">
                        <code className="font-mono text-purple-600 text-xs">(define baroqueA4 415.00)</code>
                        <div className="text-gray-600 mt-1 ml-4 text-left">
                          <p>Give names to values to refer to them later.</p>
                          <p>You can also name note combinations to play later like so:
                            <pre className="font-mono text-purple-600 text-xs mt-2 whitespace-pre-wrap">{`(define c-major-chord
  (harmony
    (tone C4 500)
    (tone E4 500)
    (tone G4 500)))

(c-major-chord)`}</pre></p>
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
              <a href="#walkthrough" className="text-purple-600 hover:text-purple-800 underline">
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
