/* cspell:words Lyre tupled lowpass highpass sawtooth desugar ADSR buzzy */
import { useContext } from 'react';
import { TooltipContext } from '../tooltipContext.js';

const pillStyle = {
  background: '#ede9fe',
  border: '1px solid #a78bfa',
  padding: '3px 9px',
  fontSize: 12,
  color: '#374151',
  borderRadius: 3,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  lineHeight: 1.2,
  fontFamily: 'Inter, sans-serif',
  cursor: 'help',
};

const pillTooltips = {
  'C1 … A#3 … F4 … G6': 'Musical pitches resolved to frequencies in Hz',
  '.': 'Tick duration in seconds /default 0.5/',
  'wave': 'Default oscillator used by play /default sine/',
  'attack': 'ADSR attack time in seconds /default 0.005/',
  'decay': 'ADSR decay time in seconds /default 0/',
  'sustain': 'ADSR sustain amplitude /default 1/',
  'release': 'ADSR release time in seconds /default 0.005/',
  'sine': 'Pure sine wave oscillator',
  'sawtooth': 'Sawtooth wave - bright and buzzy',
  'square': 'Square wave - hollow, clarinet-like',
  'triangle': 'Triangle wave - soft, close to sine',
  'flat': 'Constant DC signal at a given value',
  'envelope': 'ADSR amplitude shaping over time',
  'gain': 'Scales amplitude by a factor',
  'lowpass': 'Lowpass filter - cuts above the cutoff frequency',
  'highpass': 'Highpass filter - cuts below the cutoff frequency',
  'sequence': 'Play sources one after another',
  'harmony': 'Sum sources sample-by-sample - raw mix',
  'mix': 'Harmony normalized by voice count',
  '+': 'Add - on numbers or sample-by-sample on generators',
  '-': 'Subtract - on numbers or sample-by-sample on generators',
  '*': 'Multiply - on numbers or sample-by-sample on generators',
  '/': 'Divide - on numbers or sample-by-sample on generators',
  'gate': 'Run a source for N seconds, then stop',
  'play': 'Wraps tone with default ADSR, tick, and waveform',
};

function Pill({ name, groupTooltip }) {
  const { setTooltip } = useContext(TooltipContext);
  return (
    <span
      style={pillStyle}
      onMouseEnter={() => setTooltip(pillTooltips[name] || null)}
      onMouseLeave={() => setTooltip(groupTooltip)}
    >
      {name}
    </span>
  );
}

const blobStyle = {
  background: 'rgba(245,243,255,0.55)',
  border: '1px dotted #c4b5fd',
  borderRadius: 4,
  padding: '12px 12px 22px',
  position: 'relative',
  boxSizing: 'border-box',
  minHeight: 86,
  cursor: 'help',
};

const blobLabelStyle = {
  position: 'absolute',
  bottom: 6,
  right: 12,
  fontSize: 10,
  fontStyle: 'italic',
  textTransform: 'lowercase',
  color: '#9ca3af',
  fontWeight: 500,
};

const groupTooltips = {
  'Tones': 'Musical pitches in Hz - the frequencies a note resolves to',
  'Control knobs': 'Defaults play reads from the environment - tick, wave, ADSR',
  'Raw signals': 'Infinite waveform generators - feed through gate to bound them',
  'Shapers': 'Amplitude transforms over time - applied to a single source',
  'Filters': 'Frequency-domain transforms - cut above or below a cutoff',
  'Composers': 'Combine multiple sources - serially or in parallel',
  'Arithmetic': 'Scalar math, also operates sample-by-sample on generators',
  'Framing': 'Bound an infinite signal in time - finishers',
};

function Blob({ label, entries }) {
  const { setTooltip } = useContext(TooltipContext);
  const groupTooltip = groupTooltips[label] || null;
  return (
    <div
      style={blobStyle}
      onMouseEnter={() => setTooltip(groupTooltip)}
      onMouseLeave={() => setTooltip(null)}
    >
      <div style={blobLabelStyle}>{label}</div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 5,
          alignItems: 'center',
        }}
      >
        {entries.map((e, i) => (
          <Pill key={i} name={e} groupTooltip={groupTooltip} />
        ))}
      </div>
    </div>
  );
}

const groups = [
  { label: 'Tones', entries: ['C1 … A#3 … F4 … G6'] },
  { label: 'Control knobs', entries: ['.', 'wave', 'attack', 'decay', 'sustain', 'release'] },
  { label: 'Raw signals', entries: ['sine', 'sawtooth', 'square', 'triangle', 'flat'] },
  { label: 'Shapers', entries: ['envelope', 'gain'] },
  { label: 'Filters', entries: ['lowpass', 'highpass'] },
  { label: 'Composers', entries: ['sequence', 'harmony', 'mix'] },
  { label: 'Arithmetic', entries: ['+', '-', '*', '/'] },
  null,
  { label: 'Framing', entries: ['gate', 'play'] },
];

const outerStyle = {
  width: 820,
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
  border: '1px dashed #c4b5fd',
  borderRadius: 6,
  background: 'rgba(245,243,255,0.35)',
  padding: 14,
};

const mapStyle = {
  boxSizing: 'border-box',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 10,
};

const preludeLabelStyle = {
  fontSize: 13,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: '#7c3aed',
  fontWeight: 600,
  textAlign: 'center',
  alignSelf: 'center',
};

function PreludeLabel() {
  return <div style={preludeLabelStyle}>prelude</div>;
}

function PreludeMap() {
  return (
    <div style={outerStyle}>
      <div style={mapStyle}>
        {groups.map((g, i) =>
          g ? <Blob key={i} label={g.label} entries={g.entries} /> : <PreludeLabel key={i} />
        )}
      </div>
    </div>
  );
}

const nodes = [
  {
    id: 'namespace',
    type: 'multi',
    data: {
      label: <PreludeMap />,
      style: { background: 'transparent', border: 'none', padding: 0 },
    },
    position: { x: 0, y: 0 },
    draggable: false,
    selectable: false,
    connectable: false,
  },
];

export const languagePrelude = {
  nodes,
  edges: [],
  tooltips: {},
  height: 360,
};
