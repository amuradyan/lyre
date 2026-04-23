/* cspell:words Lyre tupled lowpass highpass sawtooth desugar */

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
};

function Pill({ children }) {
  return <span style={pillStyle}>{children}</span>;
}

const blobStyle = {
  background: 'rgba(245,243,255,0.55)',
  border: '1px dotted #c4b5fd',
  borderRadius: 4,
  padding: '12px 12px 22px',
  position: 'relative',
  boxSizing: 'border-box',
  minHeight: 86,
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

function Blob({ label, entries }) {
  return (
    <div style={blobStyle}>
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
          <Pill key={i}>{e}</Pill>
        ))}
      </div>
    </div>
  );
}

const groups = [
  { label: 'Tones', entries: ['C1 … G6'] },
  { label: 'Control knobs', entries: ['.', 'wave', 'attack', 'decay', 'sustain', 'release'] },
  { label: 'Raw signals', entries: ['sine', 'sawtooth', 'square', 'triangle', 'flat'] },
  { label: 'Shapers', entries: ['envelope', 'gain'] },
  { label: 'Filters', entries: ['lowpass', 'highpass'] },
  { label: 'Composers', entries: ['sequence', 'harmony', 'mix'] },
  { label: 'Arithmetic', entries: ['+', '−', '×', '÷'] },
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
  tooltips: {
    namespace:
      'Every name resolves through the same lookup - notes, knobs, and functions side by side. The groupings are a reading aid; the namespace is flat',
  },
  height: 360,
};
