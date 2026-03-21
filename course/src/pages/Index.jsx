import { useState, useCallback } from 'react';
import LyreCodeblock from '../components/slide/codeblock/LyreCodeblock.jsx';
import Playlist from '../components/Playlist.jsx';
import pachelbelsCanonPlain from '../assets/examples/pachelbels-canon-in-d-plain.lyre?raw';
import pachelbelsCanonCode from '../assets/examples/pachelbels-canon-in-d.lyre?raw';

const sections = [
  {
    key: 'produce',
    title: 'Produce sounds',
    starter: '(tone 440) ; A4 sine wave that will go on forever\n; Comment tone to hear the play \n\n(play 2 C4) ; Two ticks of middle C\n:C4         ; same, sugar\n',
    entries: [
      {
        signature: '(tone frequency)',
        description: 'Generate infinite sine wave at given frequency in Hz',
        example: '(tone 440) ; A4 sine wave',
      },
      {
        signature: '(play ticks note)',
        description: 'Play note for given number of ticks',
        example: '(play 2 C4) ; Two ticks of middle C',
        sugar: ':C4',
      },
    ],
  },
  {
    key: 'shape',
    title: 'Shape sounds',
    starter: '(envelope 0.01 1.0 0 0.5 0\n  (tone 261.63)) ; Plucked C4\n\n(gain\n  (envelope 0.01 1.0 0 0.5 0\n    (tone 261.63))\n  0.5) ; Half volume\n',
    entries: [
      {
        signature: '(envelope attack decay sustain release gate source1 ...)',
        description: 'Apply ADSR envelope. All times in seconds',
        example: `(envelope 0.01 1.0 0 0.5 0\n  (tone 261.63)) ; Plucked C4`,
        multiline: true,
      },
      {
        signature: '(gain source level)',
        description: 'Control volume, level from 0 to 1',
        example: `(gain\n  (envelope ...) 0.5) ; Half volume`,
        multiline: true,
      },
    ],
  },
  {
    key: 'bind',
    title: 'Name values',
    starter: '(let\n  (freq 440\n   dur 0.5)\n  (envelope 0.01 0.1 0 0.2 dur\n    (tone freq)))\n',
    entries: [
      {
        signature: '(let (var1 val1 var2 val2 ...) body)',
        description: 'Create local bindings',
        example: `(let\n  (freq 440\n   dur 0.5)\n  (envelope 0.01 0.1 0 0.2 dur\n    (tone freq))) ; Parameterized note`,
        multiline: true,
      },
    ],
  },
  {
    key: 'compose',
    title: 'Compose sounds',
    starter: '; Melody\n(sequence (play 1 C4) (play 1 E4) (play 1 G4))\n-((play 1 C4) (play 1 E4) (play 1 G4)) ; sugar\n\n; Chord\n(mix (play 1 C4) (play 1 E4) (play 1 G4))\n=((play 1 C4) (play 1 E4) (play 1 G4)) ; sugar\n\n; Raw sum\n(harmony (play 1 C4) (play 1 E4) (play 1 G4))\n',
    entries: [
      {
        signature: '(sequence sound1 sound2 ...)',
        description: 'Play sounds one after another',
        example: '(sequence noteC noteD noteE) ; Melody',
        sugar: '-(noteC noteD noteE)',
      },
      {
        signature: '(mix sound1 sound2 ...)',
        description: 'Play sounds simultaneously, normalized',
        example: '(mix noteC noteE noteG) ; C major chord',
        sugar: '=(noteC noteE noteG)',
      },
      {
        signature: '(harmony sound1 sound2 ...)',
        description: 'Play sounds simultaneously, raw sum',
        example: '(harmony noteC noteE noteG) ; Unmixed chord',
      },
    ],
  },
];

function SectionContent({ entries }) {
  return (
    <ul className="space-y-3 text-sm">
      {entries.map((entry, i) => (
        <li key={i} className="text-left">
          <code className="font-mono text-purple-600 text-xs">{entry.signature}</code>
          <div className="text-gray-600 mt-1 ml-4">
            <div className="mb-1">{entry.description}</div>
            {entry.multiline
              ? <pre className="font-mono text-purple-500 text-xs">{entry.example}</pre>
              : <code className="font-mono text-purple-500 text-xs">{entry.example}</code>
            }
            {entry.sugar && (
              <div className="mt-2 ml-4 text-gray-500 text-xs">
                <code className="font-mono text-purple-400">{entry.sugar}</code>
                <span className="ml-2">- sugar</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Index() {
  const [plainCode, setPlainCode] = useState(pachelbelsCanonPlain);
  const [exampleCode, setExampleCode] = useState(pachelbelsCanonCode);
  const [selectedExample, setSelectedExample] = useState('pachelbels-canon-in-d');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [sectionCode, setSectionCode] = useState(
    () => Object.fromEntries(sections.map(s => [s.key, s.starter]))
  );

  const handleSelectExample = useCallback((exampleId, exampleCode) => {
    setSelectedExample(exampleId);
    setExampleCode(exampleCode);
  }, []);

  const updateSectionCode = useCallback((key, value) => {
    setSectionCode(prev => ({ ...prev, [key]: value }));
  }, []);

  const current = sections[carouselIndex];

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-indigo-100 -z-10"></div>
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-12">

          {/* Title */}
          <div className="flex items-end gap-4 mb-10">
            <img src="/lyre.png" alt="Lyre" className="w-48 h-auto" />
            <p className="text-l text-gray-600 pb-2">\ a music streaming lisp</p>
          </div>

          {/* Row 1: Plain Pachelbel + P1 P2 P3 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center mb-8">
            <div className="lg:col-span-3">
              <LyreCodeblock
                code={plainCode}
                onChange={setPlainCode}
                showContainer={true}
              />
            </div>

            <div className="lg:col-span-2 flex items-center">
              <div className="text-center space-y-4 text-[17px] text-gray-600">
                <p>
                  Lyre is a system comprising of a Lisp-like language for writing music and a rather simple synthesizer
                  that streams that music.
                </p>
                <p>
                  This is the Canon in D of Pachelbel. As in any lisp, we write expressions to produce values - tones of given
                  frequencies, durations and amplitudes in our case.
                </p>
                <p>
                  We also write expressions to put them in a sequence or in parallel and then again for something else.
                  Looks rather noisy for a music description, right?
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center mb-8">
            <div className="lg:col-span-2 flex items-center">
              <div className="text-center space-y-4 text-[17px] text-gray-600">
                <p>
                  To distance the reader from such mechanical aspects of the language and to look more musical, some
                  functions are sugared. A notable part of that sugar is the <i>dot</i> notation - prefixing and postfixing
                  a note name or, rather any frequency, with dots and colons to get an enveloped tone with automatic duration.
                </p>
                <p>
                  Each <code>.</code> counts as one tick, Left side multiplies, right side divides - so <code>.C4</code> is
                  one tick, <code>:G4</code> is two, and <code>.Bb4:</code> is a half. The canon from the previous example then
                  becomes much shorter and music-alike.
                </p>
                <p>
                  Lyre also allows assigning names to values and referring to them later. A nice example of that coming
                  in handy for notation is the <i>SOS</i> sound in the examples.
                </p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="space-y-2">
                <Playlist
                  onSelectExample={handleSelectExample}
                  selectedExample={selectedExample}
                />
                <LyreCodeblock
                  code={exampleCode}
                  onChange={setExampleCode}
                  showContainer={true}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-sm shadow-sm p-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCarouselIndex((carouselIndex - 1 + sections.length) % sections.length)}
                className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-lg"
              >
                ‹
              </button>
              <div className="flex gap-2">
                {sections.map((section, i) => (
                  <button
                    key={section.key}
                    onClick={() => setCarouselIndex(i)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${carouselIndex === i
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCarouselIndex((carouselIndex + 1) % sections.length)}
                className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-lg"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">{current.title}</h3>
                <SectionContent entries={current.entries} />
              </div>
              <div>
                <LyreCodeblock
                  code={sectionCode[current.key]}
                  onChange={(value) => updateSectionCode(current.key, value)}
                  showContainer={true}
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-12 space-y-2">
            <p className="text-gray-500 text-sm">
              <strong>Note:</strong> For a deeper dive into language implementation, check out the{' '}
              <a href="#walkthrough" className="text-purple-600 hover:text-purple-800 underline">
                walkthrough
              </a>{' '}
              /always under construction 🚧/
            </p>
            <p className="text-gray-400 text-xs">
              🤖 All the front end courtesy of robots, mainly Claude 🤖
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
