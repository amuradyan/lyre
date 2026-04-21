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

const preludeEntries = [
  'C1 ... G6',
  '.', 'attack', 'decay', 'sustain', 'release', 'wave',
  'sine', 'sawtooth', 'square', 'triangle', 'flat',
  'gate', 'envelope', 'gain', 'lowpass', 'highpass',
  '+', '−', '×', '÷',
  'sequence', 'harmony', 'mix', 'play',
];

const namespaceStyle = {
  width: 820,
  background: 'rgba(245,243,255,0.55)',
  border: '1px dashed #c4b5fd',
  borderRadius: 4,
  padding: '26px 18px 16px',
  position: 'relative',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
};

const namespaceLabelStyle = {
  position: 'absolute',
  top: 8,
  left: 16,
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#7c3aed',
  fontWeight: 600,
};

function NamespaceBox() {
  return (
    <div style={namespaceStyle}>
      <div style={namespaceLabelStyle}>one namespace · one lookup</div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {preludeEntries.map((e, i) => (
          <Pill key={i}>{e}</Pill>
        ))}
      </div>
    </div>
  );
}

const nodes = [
  {
    id: 'namespace',
    type: 'multi',
    data: {
      label: <NamespaceBox />,
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
      'Every name in Lyre resolves through the same lookup. Notes, defaults, and functions all live side by side. Earlier bindings shadow later ones - let shadows the prelude',
  },
  height: 170,
};
