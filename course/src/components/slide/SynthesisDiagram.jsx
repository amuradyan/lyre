const oscillators = [
  { harm: 1, freq: '233 Hz', amp: '100%', db: '0 dB', note: 'A#3' },
  { harm: 2, freq: '466 Hz', amp: '50%', db: '-6 dB', note: 'A#4' },
  { harm: 4, freq: '932 Hz', amp: '92%', db: '-0.7 dB', note: 'A#5' },
  { harm: 8, freq: '1864 Hz', amp: '81%', db: '-1.8 dB', note: 'A#6' },
  { harm: 18, freq: '4196 Hz', amp: '93%', db: '-0.6 dB', note: 'C8' }
];

export default function SynthesisDiagram() {
  return (
    <div className="my-6 overflow-x-auto">
      <div className="flex gap-3 min-w-max bg-white border border-gray-200 rounded p-4">

        <div className="flex-shrink-0 w-32 flex flex-col">
          <div className="text-xs font-bold text-gray-600 mb-2 text-center">OSCILLATORS</div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col gap-1.5">
              {oscillators.map((osc, i) => (
                <div key={i} className="border border-gray-300 rounded p-1.5 bg-gray-50">
                  <div className="text-[9px] text-gray-500 mb-0.5">Harmonic {osc.harm}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-[11px] font-bold font-mono">{osc.freq}</div>
                    <div className="text-[9px]">{osc.amp}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-[10px] text-gray-600">{osc.note}</div>
                    <div className="text-[9px] text-gray-600">{osc.db}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[9px] text-gray-500 mt-2 text-center">Pure sine waves</div>
        </div>

        <div className="flex-shrink-0 w-28 flex flex-col">
          <div className="text-xs font-bold text-gray-600 mb-2 text-center">MIXER</div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="border border-gray-300 rounded p-3 bg-gray-50 flex flex-col justify-center">
              <div className="text-2xl font-bold text-center">Σ</div>
              <div className="text-[11px] text-center mt-1">Additive Mix</div>
            </div>
          </div>
          <div className="text-[9px] text-gray-500 mt-2 text-center">All signals summed</div>
        </div>

        <div className="flex-shrink-0 w-36 flex flex-col">
          <div className="text-xs font-bold text-gray-600 mb-2 text-center">FILTERS</div>
          <div className="flex-1 flex flex-col justify-center">
            <div>
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mb-2">
                <div className="text-[11px] font-bold text-center">Low-Pass</div>
                <div className="text-[9px] text-gray-600 text-center">Cutoff: ~6000 Hz</div>
                <div className="text-[9px] text-gray-600 text-center">Resonance: 0.3</div>
                <svg viewBox="0 0 100 30" className="w-full h-8 mt-1">
                  <path d="M 0 25 L 60 25 Q 75 25 85 15 Q 95 5 100 5"
                    fill="none" stroke="#8b5cf6" strokeWidth="2" />
                  <line x1="70" y1="0" x2="70" y2="30" stroke="#8b5cf6" strokeDasharray="2" opacity="0.5" />
                </svg>
              </div>
              <div className="border border-gray-300 rounded p-2 bg-gray-50">
                <div className="text-[11px] font-bold text-center">Body Resonance</div>
                <div className="text-[9px] text-gray-600 text-center">Peak: ~1400 Hz</div>
                <div className="text-[9px] text-gray-600 text-center">Peak: ~3100 Hz</div>
                <svg viewBox="0 0 100 30" className="w-full h-8 mt-1">
                  <path d="M 0 22 Q 20 22 30 12 Q 40 22 50 18 Q 60 8 70 18 Q 80 22 100 22"
                    fill="none" stroke="#8b5cf6" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>
          <div className="text-[9px] text-gray-500 mt-2 text-center">Shape tone, add resonance</div>
        </div>

        <div className="flex-shrink-0 w-36 flex flex-col">
          <div className="text-xs font-bold text-gray-600 mb-2 text-center">AMPLITUDE ENVELOPE</div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="border border-gray-300 rounded p-2 bg-gray-50">
              <div className="text-[11px] font-bold text-center">ADSR</div>
              <div className="grid grid-cols-4 gap-1 text-[9px] mt-1 text-center">
                <div><div className="text-gray-500">A</div><div>5ms</div></div>
                <div><div className="text-gray-500">D</div><div>200ms</div></div>
                <div><div className="text-gray-500">S</div><div>30%</div></div>
                <div><div className="text-gray-500">R</div><div>800ms</div></div>
              </div>
              <svg viewBox="0 0 100 35" className="w-full h-12 mt-1">
                <path d="M 0 35 L 5 5 L 20 15 L 60 15 L 100 35"
                  fill="none" stroke="#8b5cf6" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="text-[9px] text-gray-500 mt-2 text-center">Volume over time</div>
        </div>

        <div className="flex-shrink-0 w-36 flex flex-col">
          <div className="text-xs font-bold text-gray-600 mb-2 text-center">FILTER ENVELOPES</div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="border border-gray-300 rounded p-2 bg-gray-50 flex flex-col justify-center">
              <div className="text-[11px] font-bold text-center">Cutoff Frequency</div>
              <div className="text-[9px] text-gray-600 text-center mt-1">Cutoff starts high, drops slower in the beginning, faster in the end</div>
              <svg viewBox="0 0 100 30" className="w-full h-10 mt-2">
                <path d="M 0 25 L 5 5 Q 30 8 50 18 Q 70 23 100 25"
                  fill="none" stroke="#8b5cf6" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="text-[9px] text-gray-500 mt-2 text-center">Bright attack → mellow</div>
        </div>

        <div className="flex-shrink-0 w-28 flex flex-col">
          <div className="text-xs font-bold text-gray-600 mb-2 text-center">OUTPUT</div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="border border-gray-300 rounded p-3 bg-gray-50 flex flex-col justify-center items-center">
              <div className="text-3xl">🪉</div>
            </div>
          </div>
          <div className="text-[9px] text-gray-500 mt-2 text-center">Final sound of a lyre</div>
        </div>

      </div>
    </div>
  );
}
