/* cspell:words xyflow tupled */
import {
  primitiveStyle,
  outputStyle,
  wrapStyle,
  arrowDeep,
  arrowStub,
  boldEdgeStyle,
  thinEdgeStyle,
  H_COMPACT,
  H_STANDARD,
  H_EMPHASIS,
  H_BUS,
  TwoLineLabel,
} from './shared.jsx';

// Dimensions
const PRIMITIVE_W = 90;
const EDGE_W = 160;
const BUS_W = 520;
const OUTPUT_W = 70;

// Layout — everything on the main row shares BASELINE_Y
const BASELINE_Y = 135;
const BUS_Y = BASELINE_Y - H_BUS / 2;
const RAW_Y = BASELINE_Y - H_EMPHASIS / 2;
const WRAP_Y = BASELINE_Y - H_EMPHASIS / 2;
const OUTPUT_Y = BASELINE_Y - H_STANDARD / 2;

const RAW_X = 0;
const WRAP_X = 247;
const BUS_X = 502;
const OUTPUT_X = 1109;

const ABOVE_Y = 50;
const BELOW_Y = 190;

const aboveCenters = [554, 658, 762, 866, 970];
const belowCenters = [567, 697, 827, 957];
const abovePercents = ['10%', '30%', '50%', '70%', '90%'];
const belowPercents = ['12.5%', '37.5%', '62.5%', '87.5%'];

const primitiveBoxStyle = { ...primitiveStyle, width: PRIMITIVE_W, height: H_COMPACT };

// Waveform icons for the raw-oscillators label
const wavePaths = {
  sine: 'M 0 6 Q 5 -4 10 6 T 20 6',
  saw: 'M 0 11 L 20 1 L 20 11',
  square: 'M 0 11 L 0 1 L 10 1 L 10 11 L 20 11',
  triangle: 'M 0 6 L 5 1 L 15 11 L 20 6',
  flat: 'M 0 6 L 20 6',
};

function WaveIcon({ type }) {
  return (
    <svg
      width="20"
      height="12"
      viewBox="0 0 20 12"
      overflow="visible"
      fill="none"
      stroke="#7c3aed"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      shapeRendering="geometricPrecision"
    >
      <path d={wavePaths[type]} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const rawLabel = (
  <div className="flex flex-col items-center leading-tight">
    <div>raw oscillators</div>
    <div style={{ display: 'flex', gap: 5, marginTop: 8, alignItems: 'center' }}>
      <WaveIcon type="saw" />
      <WaveIcon type="sine" />
      <WaveIcon type="square" />
      <WaveIcon type="triangle" />
      <WaveIcon type="flat" />
    </div>
  </div>
);

const abovePrimitives = ['gate', 'envelope', 'gain', 'lowpass', 'highpass'];
const belowPrimitives = ['math', 'sequence', 'harmony', 'mix'];

const primitiveLabels = {
  gate: 'gate',
  envelope: 'envelope',
  gain: 'gain',
  lowpass: 'lowpass',
  highpass: 'highpass',
  math: '+  -  *  /',
  sequence: 'sequence',
  harmony: 'harmony',
  mix: 'mix',
};

const nodes = [
  {
    id: 'raw',
    type: 'multi',
    data: {
      label: rawLabel,
      style: { ...primitiveStyle, width: EDGE_W, height: H_EMPHASIS, flexDirection: 'column', lineHeight: 1.15 },
    },
    position: { x: RAW_X, y: RAW_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'wrap',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="wrap" bottom="fixed or varying frequency" />,
      style: { ...wrapStyle, width: EDGE_W, height: H_EMPHASIS },
    },
    position: { x: WRAP_X, y: WRAP_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'bus',
    type: 'bus',
    data: {
      label: 'tupled bus · any-to-any',
      style: { width: BUS_W, height: H_BUS },
      topHandles: abovePercents,
      bottomHandles: belowPercents,
    },
    position: { x: BUS_X, y: BUS_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'output',
    type: 'multi',
    data: {
      label: 'output',
      style: { ...outputStyle, width: OUTPUT_W, height: H_STANDARD },
    },
    position: { x: OUTPUT_X, y: OUTPUT_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-raw',
    type: 'edgeLabel',
    data: { top: 'raw', bottom: 'signal' },
    position: { x: 183, y: 122 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-wrap-bus',
    type: 'edgeLabel',
    data: { top: 'tupled', bottom: 'signal' },
    position: { x: 434, y: 122 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-bus-output',
    type: 'edgeLabel',
    data: { top: 'tupled', bottom: 'signal' },
    position: { x: 1045, y: 122 },
    draggable: false, selectable: false, connectable: false,
  },
  ...abovePrimitives.map((id, i) => ({
    id,
    type: 'multi',
    data: { label: primitiveLabels[id], style: primitiveBoxStyle },
    position: { x: aboveCenters[i] - PRIMITIVE_W / 2, y: ABOVE_Y },
    draggable: false, selectable: false, connectable: false,
  })),
  ...belowPrimitives.map((id, i) => ({
    id,
    type: 'multi',
    data: { label: primitiveLabels[id], style: primitiveBoxStyle },
    position: { x: belowCenters[i] - PRIMITIVE_W / 2, y: BELOW_Y },
    draggable: false, selectable: false, connectable: false,
  })),
];

const edges = [
  {
    id: 'e-raw-wrap',
    source: 'raw', target: 'wrap',
    sourceHandle: 'r-out', targetHandle: 'l-in',
    type: 'smoothstep',
    markerEnd: arrowDeep,
    style: boldEdgeStyle,
  },
  {
    id: 'e-wrap-bus',
    source: 'wrap', target: 'bus',
    sourceHandle: 'r-out', targetHandle: 'l-in',
    type: 'smoothstep',
    markerEnd: arrowDeep,
    style: boldEdgeStyle,
  },
  {
    id: 'e-bus-output',
    source: 'bus', target: 'output',
    sourceHandle: 'r-out', targetHandle: 'l-in',
    type: 'smoothstep',
    markerEnd: arrowDeep,
    style: boldEdgeStyle,
  },
  ...abovePrimitives.map((id, i) => ({
    id: `stub-${id}`,
    source: id, target: 'bus',
    sourceHandle: 'b-out', targetHandle: `t-${i}`,
    type: 'straight',
    style: thinEdgeStyle,
    markerStart: arrowStub,
    markerEnd: arrowStub,
  })),
  ...belowPrimitives.map((id, i) => ({
    id: `stub-${id}`,
    source: id, target: 'bus',
    sourceHandle: 't-out', targetHandle: `b-${i}`,
    type: 'straight',
    style: thinEdgeStyle,
    markerStart: arrowStub,
    markerEnd: arrowStub,
  })),
];

export const engineMain = {
  nodes,
  edges,
  tooltips: {
    raw: 'Five stateless generators that yield plain numbers: sine, sawtooth, square, triangle, flat',
    wrap: 'Lifts a raw oscillator into the tupled world. Dispatches to modulate when given a generator frequency',
    bus: 'The tupled world is a shared bus. Any primitive\u2019s output can feed any other primitive\u2019s input',
    gate: 'Time-boxes an infinite signal to a duration. The only primitive that sets length',
    envelope: 'ADSR amplitude shaping. Reads duration from its source\u2019s totalSamples',
    gain: 'Multiplies every sample by a level',
    lowpass: 'First-order low-pass filter. Cutoff can be a number or a generator for sweeps',
    highpass: 'First-order high-pass filter. Same cutoff rules as lowpass',
    math: 'Sample-by-sample arithmetic. Each operand can be a number or a generator',
    harmony: 'Sums voices in parallel without normalization',
    mix: 'Sums voices in parallel, divided by voice count to prevent clipping',
    sequence: 'Plays voices one after another',
    output: 'Samples consumed by the audio worklet and streamed to the speakers',
  },
  height: 200,
};
