/* cspell:words xyflow tupled */
import { Handle, Position, MarkerType } from '@xyflow/react';

const PRIMITIVE_W = 90;
const PRIMITIVE_H = 40;
const EDGE_W = 160;
const EDGE_H = 50;
const RAW_H = 66;
const WRAP_H = 100;
const WRAP_W = 135;
const BUS_W = 520;
const BUS_H = 24;
const OUTPUT_W = 70;

const RAW_X = 0;
const WRAP_X = 210;
const BUS_X = 420;
const OUTPUT_X = 990;
const MAIN_Y = 110;
const BUS_Y = 123;
const RAW_Y = 135 - RAW_H / 2;
const WRAP_Y = 135 - WRAP_H / 2;

const ABOVE_Y = 50;
const BELOW_Y = 190;

const aboveCenters = [472, 576, 680, 784, 888];
const belowCenters = [485, 615, 745, 875];

const abovePercents = ['10%', '30%', '50%', '70%', '90%'];
const belowPercents = ['12.5%', '37.5%', '62.5%', '87.5%'];

const primitiveStyle = {
  background: '#ddd6fe',
  border: 'none',
  borderRadius: 4,
  padding: '6px 10px',
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
  width: PRIMITIVE_W,
  height: PRIMITIVE_H,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const edgePieceStyle = {
  ...primitiveStyle,
  width: EDGE_W,
  height: EDGE_H,
};

const rawStyle = {
  ...edgePieceStyle,
  height: RAW_H,
  flexDirection: 'column',
  lineHeight: 1.15,
};

const wrapStyle = {
  ...edgePieceStyle,
  width: WRAP_W,
  height: WRAP_H,
  background: '#ddd6fe',
  border: 'none',
  color: '#374151',
  fontWeight: 600,
  flexDirection: 'column',
  lineHeight: 1.15,
};

const outputStyle = {
  ...edgePieceStyle,
  width: OUTPUT_W,
  borderRadius: 9999,
  background: '#ede9fe',
  border: 'none',
  color: '#111827',
  fontWeight: 500,
};

const busStyle = {
  width: BUS_W,
  height: BUS_H,
  borderRadius: 6,
  background: '#9ca3af',
  border: 'none',
  color: '#1f2937',
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  position: 'relative',
  lineHeight: 1,
};

const hiddenHandle = {
  width: 6,
  height: 6,
  background: 'transparent',
  border: 'none',
  minWidth: 0,
  minHeight: 0,
};

function MultiHandleNode({ data }) {
  const style = data.style || primitiveStyle;
  return (
    <div style={style}>
      <Handle type="target" position={Position.Top} id="t-in" style={hiddenHandle} />
      <Handle type="target" position={Position.Right} id="r-in" style={hiddenHandle} />
      <Handle type="target" position={Position.Bottom} id="b-in" style={hiddenHandle} />
      <Handle type="target" position={Position.Left} id="l-in" style={hiddenHandle} />
      <Handle type="source" position={Position.Top} id="t-out" style={hiddenHandle} />
      <Handle type="source" position={Position.Right} id="r-out" style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} id="b-out" style={hiddenHandle} />
      <Handle type="source" position={Position.Left} id="l-out" style={hiddenHandle} />
      {data.label}
    </div>
  );
}

function EdgeLabelNode({ data }) {
  return (
    <div
      style={{
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
        lineHeight: 1,
        pointerEvents: 'none',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 500 }}>{data.top}</div>
      <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 500 }}>{data.bottom}</div>
    </div>
  );
}

function BusNode({ data }) {
  return (
    <div style={busStyle}>
      <Handle type="target" position={Position.Left} id="l-in" style={hiddenHandle} />
      <Handle type="source" position={Position.Right} id="r-out" style={hiddenHandle} />
      {abovePercents.map((left, i) => (
        <Handle
          key={`t-${i}`}
          type="target"
          position={Position.Top}
          id={`t-${i}`}
          style={{ ...hiddenHandle, left }}
        />
      ))}
      {belowPercents.map((left, i) => (
        <Handle
          key={`b-${i}`}
          type="target"
          position={Position.Bottom}
          id={`b-${i}`}
          style={{ ...hiddenHandle, left }}
        />
      ))}
      {data.label}
    </div>
  );
}

export const nodeTypes = {
  multi: MultiHandleNode,
  bus: BusNode,
  edgeLabel: EdgeLabelNode,
};

const wrapLabel = (
  <div className="flex flex-col items-center leading-tight">
    <div>wrap</div>
    <div className="text-[10px] italic text-purple-700 mt-2">fixed or varying frequency</div>
  </div>
);

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
  math: '+  −  ×  ÷',
  sequence: 'sequence',
  harmony: 'harmony',
  mix: 'mix',
};

const nodes = [
  {
    id: 'raw',
    type: 'multi',
    data: { label: rawLabel, style: rawStyle },
    position: { x: RAW_X, y: RAW_Y },
    draggable: false,
    selectable: false,
    connectable: false,
  },
  {
    id: 'wrap',
    type: 'multi',
    data: { label: wrapLabel, style: wrapStyle },
    position: { x: WRAP_X, y: WRAP_Y },
    draggable: false,
    selectable: false,
    connectable: false,
  },
  {
    id: 'bus',
    type: 'bus',
    data: { label: 'tupled bus · any-to-any' },
    position: { x: BUS_X, y: BUS_Y },
    draggable: false,
    selectable: false,
    connectable: false,
  },
  {
    id: 'output',
    type: 'multi',
    data: { label: 'output', style: outputStyle },
    position: { x: OUTPUT_X, y: MAIN_Y },
    draggable: false,
    selectable: false,
    connectable: false,
  },
  {
    id: 'label-raw',
    type: 'edgeLabel',
    data: { top: 'raw', bottom: 'signal' },
    position: { x: 165, y: 122 },
    draggable: false,
    selectable: false,
    connectable: false,
  },
  {
    id: 'label-wrap-bus',
    type: 'edgeLabel',
    data: { top: 'tupled', bottom: 'signal' },
    position: { x: 362, y: 122 },
    draggable: false,
    selectable: false,
    connectable: false,
  },
  {
    id: 'label-bus-output',
    type: 'edgeLabel',
    data: { top: 'tupled', bottom: 'signal' },
    position: { x: 945, y: 122 },
    draggable: false,
    selectable: false,
    connectable: false,
  },
  ...abovePrimitives.map((id, i) => ({
    id,
    type: 'multi',
    data: { label: primitiveLabels[id] },
    position: { x: aboveCenters[i] - PRIMITIVE_W / 2, y: ABOVE_Y },
    draggable: false,
    selectable: false,
    connectable: false,
  })),
  ...belowPrimitives.map((id, i) => ({
    id,
    type: 'multi',
    data: { label: primitiveLabels[id] },
    position: { x: belowCenters[i] - PRIMITIVE_W / 2, y: BELOW_Y },
    draggable: false,
    selectable: false,
    connectable: false,
  })),
];

const purpleDeep = '#7c3aed';
const gray = '#9ca3af';

const arrowDeep = { type: MarkerType.ArrowClosed, color: purpleDeep, width: 14, height: 14 };
const arrowStub = { type: MarkerType.ArrowClosed, color: gray, width: 8, height: 8 };

const boldEdgeStyle = { stroke: purpleDeep, strokeWidth: 1.75 };
const stubEdgeStyle = { stroke: gray, strokeWidth: 1, strokeOpacity: 0.7 };

const baseEdges = [
  {
    id: 'e-raw-wrap',
    source: 'raw',
    target: 'wrap',
    sourceHandle: 'r-out',
    targetHandle: 'l-in',
    type: 'smoothstep',
    markerEnd: arrowDeep,
    style: boldEdgeStyle,
  },
  {
    id: 'e-wrap-bus',
    source: 'wrap',
    target: 'bus',
    sourceHandle: 'r-out',
    targetHandle: 'l-in',
    type: 'smoothstep',
    markerEnd: arrowDeep,
    style: boldEdgeStyle,
  },
  {
    id: 'e-bus-output',
    source: 'bus',
    target: 'output',
    sourceHandle: 'r-out',
    targetHandle: 'l-in',
    type: 'smoothstep',
    markerEnd: arrowDeep,
    style: boldEdgeStyle,
  },
  ...abovePrimitives.map((id, i) => ({
    id: `stub-${id}`,
    source: id,
    target: 'bus',
    sourceHandle: 'b-out',
    targetHandle: `t-${i}`,
    type: 'straight',
    style: stubEdgeStyle,
    markerStart: arrowStub,
    markerEnd: arrowStub,
  })),
  ...belowPrimitives.map((id, i) => ({
    id: `stub-${id}`,
    source: id,
    target: 'bus',
    sourceHandle: 't-out',
    targetHandle: `b-${i}`,
    type: 'straight',
    style: stubEdgeStyle,
    markerStart: arrowStub,
    markerEnd: arrowStub,
  })),
];

export const engineMain = {
  nodes,
  edges: baseEdges,
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
