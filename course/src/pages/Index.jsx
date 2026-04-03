import { useState, useCallback } from 'react';
import LyreCodeblock from '../components/slide/codeblock/LyreCodeblock.jsx';
import Playlist from '../components/Playlist.jsx';
import pachelbelsCanonPlain from '../assets/examples/pachelbels-canon-in-d-plain.lyre?raw';
import pachelbelsCanonCode from '../assets/examples/pachelbels-canon-in-d.lyre?raw';

const sections = [
  {
    key: 'produce',
    title: 'Produce sounds',
    starter: '; Uncomment the lines below to hear the sound\n;\n; (tone 440)     ; Pure tone, alias of sine below\n; (sine 440)     ; Pure tone\n; (square 440)   ; Hollow, clarinet-like\n; (sawtooth 440) ; Bright, buzzy\n; (triangle 440) ; Soft, close to sine\n\n(play 0.5 C4)\n.E4:\n',
    entries: [
      {
        signature: '(tone frequency)',
        description: 'Generates an infinite sine wave. Needs an envelope to stop',
      },
      {
        signature: '(sine | square | sawtooth | triangle  frequency)',
        description: (navigate) => <>Waveform generators. Use as operators or <button className="underline text-purple-600 hover:text-purple-800" onClick={() => navigate(4)}>bind</button> to <code>wave</code> for <code>play</code> to use</>,
      },
      {
        signature: '(play ticks note) | .note :note',
        description: <>Note with default ADSR and waveform. Each <code>.</code> prefix = 1 tick, <code>:</code> = 2. Uses <code>wave</code> from environment</>,
      },
    ],
  },
  {
    key: 'shape',
    title: 'Shape sounds',
    starter: '(envelope 0.01 1.0 0 0.5 0\n  (tone 261.63)) ; Plucked C4\n\n(gain\n  (envelope 0.01 1.0 0 0.5 0\n    (tone 261.63))\n  0.5) ; Half volume\n',
    entries: [
      {
        signature: '(envelope A D S R gate source ...)',
        description: <>ADSR amplitude shaping. <code>A</code>, <code>D</code>, <code>R</code> in seconds. <code>S</code> is amplitude level, typically <code>0-1</code></>,
      },
      {
        signature: '(gain source level)',
        description: 'Multiplies amplitude. Can go above 1',
      },
    ],
  },
  {
    key: 'compose',
    title: 'Compose sounds',
    starter: '; Melody\n(sequence (play 1 C4) (play 1 E4) (play 1 G4))\n-((play 1 C4) (play 1 E4) (play 1 G4)) ; sugar\n\n; Chord\n(mix (play 1 C4) (play 1 E4) (play 1 G4))\n=((play 1 C4) (play 1 E4) (play 1 G4)) ; sugar\n\n; Raw sum\n(harmony (play 1 C4) (play 1 E4) (play 1 G4))\n',
    entries: [
      {
        signature: '(sequence a b ...) | -(a b ...)',
        description: 'Plays sounds one after another - use it to build melodies and phrases',
      },
      {
        signature: '(mix a b ...) | =(a b ...)',
        description: 'Simultaneously, normalized by voice count to prevent clipping',
      },
      {
        signature: '(harmony a b ...)',
        description: 'Simultaneously, raw sum. Pair with gain for manual mixing',
      },
    ],
  },
  {
    key: 'filter',
    title: 'Filter sounds',
    starter: '; Fixed brightness\n(lowpass 2000\n  (envelope 0.01 1.0 0 0.5 0\n    (sawtooth 261.63)))\n\n; Brightness that fades\n(lowpass (+ 500 (* 4500\n    (envelope 0 0 1 1.0 0 (dc 1))))\n  (envelope 0.01 1.0 0 0.5 0\n    (sawtooth 261.63)))\n',
    entries: [
      {
        signature: '(lowpass cutoff source ...)',
        description: <>Low-pass filter. Cutoff in Hz - a number for fixed, or a generator for sweeping</>,
      },
      {
        signature: '(highpass cutoff source ...)',
        description: 'High-pass filter. Same cutoff rules as lowpass',
      },
      {
        signature: '(+ a b)  (- a b)  (* a b)  (/ a b)',
        description: 'Arithmetic on numbers or sample-by-sample on generators. Use with dc and envelope to build filter sweeps',
      },
      {
        signature: '(dc value)',
        description: <>Constant signal. Feed through <code>envelope</code> to extract an ADSR curve for filter modulation</>,
      },
    ],
  },
  {
    key: 'bind',
    title: 'Name values',
    starter: '(let (wave square . 0.25)\n  :C4 .E4 | :G4 .B4 |\n  :C4 .F4 :G4)\n',
    entries: [
      {
        signature: '(let (name val ...) body ...)',
        description: <>Binds names in a new scope. Shadows parent names if they exist. All body expressions are sequenced. Defaults: <code>. = 0.5s</code> <code>wave = sine</code> <code>attack = 0.005</code> <code>decay = 0</code> <code>sustain = 1</code> <code>release = 0.005</code></>,
      },
    ],
  },
];

function SectionContent({ entries, onNavigate }) {
  return (
    <ul className="space-y-3 text-sm">
      {entries.map((entry, i) => (
        <li key={i} className="text-left">
          <code className="font-mono text-purple-600 text-xs">{entry.signature}</code>
          <div className="text-gray-600 mt-1 ml-4">{typeof entry.description === 'function' ? entry.description(onNavigate) : entry.description}</div>
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

          {/* P1: Full width intro */}
          <div className="mb-8">
            <p className="text-left text-[17px] text-gray-600 text-justify">
              Lyre is a duo of a Lisp-like language for writing music and a rather simple synthesizer that streams it.
              As in any lisp, we write expressions to later evaluate to values - tones of given
              frequencies, durations and amplitudes in our case. We also write expressions to put
              these tones in sequence or in parallel and then again for something else for sure.
            </p>
          </div>

          {/* P2 P3 + Plain Pachelbel */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start mb-8">
            <div className="lg:col-span-3">
              <LyreCodeblock
                code={plainCode}
                onChange={setPlainCode}
                showContainer={true}
              />
            </div>

            <div className="lg:col-span-2">
              <div className="text-left space-y-4 text-[17px] text-gray-600 text-justify">
                <p>
                  Here is the Canon in D by Pachelbel. It takes some time to figure how spatially the
                  notes are placed, then you can read the melody in between the code. Tones are the most
                  nested yet most important data, above them the duration and timbre, above that - the
                  composition pattern.
                </p>
                <p>
                  This pattern might go on as, things can get rather nested pretty
                  fast in Lisps. Looks rather noisy for a music description, right?
                </p>
              </div>
            </div>
          </div>

          {/* P4: Full width bridge */}
          <div className="mb-8">
            <p className="text-left text-[17px] text-gray-600 text-justify">
              To aid the reader in seeing the music though language mechanics, some functions are
              sugared. That sugar mostly covers composition, but a notable part of it is
              the <i>dot</i> notation - prefixing and postfixing a note name /practically a frequency/
              with dots and colons to get an enveloped tone with default duration and timbre.
            </p>
          </div>

          {/* P5 P6 + Lyre examples */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start mb-8 -mt-4">
            <div className="lg:col-span-2">
              <div className="text-left space-y-4 text-[17px] text-gray-600 text-justify">
                <p>
                  Each <code>.</code> around a note counts as one tick - a unit duration set to half a
                  second by default. Left side multiplies, right side divides -
                  so <code>.C4</code> is one tick or 0.5 seconds, <code>:G4</code> is two ticks or a
                  full second, and <code>.Bb4:</code> is a half tick or 0.25 seconds. With this notation
                  we can write the Canon much shorter and music-alike.
                </p>
                <p>
                  Lyre also allows assigning names to values and referring to them later, which makes it
                  possible to use musical notation without tampering with language syntax. A nice example
                  of that coming in handy is the SOS signal from the examples.
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

          <hr className="border-gray-200 mb-8" />

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-left">{current.title}</h3>
                <SectionContent entries={current.entries} onNavigate={setCarouselIndex} />
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
              🤖 All the front end is the courtesy of robots, mainly Claude 🤖
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
