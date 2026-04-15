import { Handle, Position, MarkerType } from '@xyflow/react';

const NODE_W = 128;

const solidStyle = {
  background: '#ede9fe',
  border: '1px solid #a78bfa',
  borderRadius: 2,
  padding: '6px 10px',
  fontSize: 13,
  fontWeight: 500,
  color: '#374151',
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
  width: NODE_W,
};

const wrapStyle = {
  ...solidStyle,
  background: '#ddd6fe',
  border: '1.5px solid #8b5cf6',
  color: '#2e1065',
  fontWeight: 600,
  paddingTop: 4,
  paddingBottom: 4,
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
  const style = data.style || solidStyle;
  return (
    <div style={style}>
      <Handle type="target" position={Position.Top}    id="t-in" style={hiddenHandle} />
      <Handle type="target" position={Position.Right}  id="r-in" style={hiddenHandle} />
      <Handle type="target" position={Position.Bottom} id="b-in" style={hiddenHandle} />
      <Handle type="target" position={Position.Left}   id="l-in" style={hiddenHandle} />
      <Handle type="source" position={Position.Top}    id="t-out" style={hiddenHandle} />
      <Handle type="source" position={Position.Right}  id="r-out" style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} id="b-out" style={hiddenHandle} />
      <Handle type="source" position={Position.Left}   id="l-out" style={hiddenHandle} />
      {data.label}
    </div>
  );
}

function GroupNode({ data }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        border: '1px dashed #c4b5fd',
        borderRadius: 4,
        background: 'rgba(245, 243, 255, 0.55)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 12,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#7c3aed',
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {data.label}
      </div>
    </div>
  );
}

export const nodeTypes = {
  multi: MultiHandleNode,
  group: GroupNode,
};

const wrapLabel = (
  <div className="flex flex-col items-center leading-tight">
    <div>wrap</div>
    <div className="text-[10px] italic text-purple-700 mt-0.5">↻ tupled values</div>
  </div>
);

// Three horizontal groups in tier 2
const GROUPS = [
  { id: 'group-producers', label: 'producers', children: ['harmony', 'mix', 'sequence'] },
  { id: 'group-shapers', label: 'shapers', children: ['gate', 'envelope', 'gain'] },
  { id: 'group-filters', label: 'filters', children: ['lowpass', 'highpass', 'math'] },
];

const TUPLED_META = {
  harmony: { label: 'harmony' },
  mix: { label: 'mix' },
  sequence: { label: 'sequence' },
  gate: { label: 'gate' },
  envelope: { label: 'envelope' },
  gain: { label: 'gain' },
  lowpass: { label: 'lowpass' },
  highpass: { label: 'highpass' },
  math: { label: '+  −  ×  ÷' },
};

const GROUP_W = 452;
const GROUP_H = 104;
const GROUP_GAP = 36;
const GROUP_PAD_LEFT = 16;
const GROUP_PAD_TOP = 50;
const CHILD_PITCH = 140;

const TIER_RAW_Y = 20;
const TIER_GROUPS_Y = 170;
const TIER_OUTPUT_Y = 340;

// Left-to-right order of tupled primitives /index determines cross-edge direction/
const tupledOrder = GROUPS.flatMap((g) => g.children);

const TOTAL_W = GROUPS.length * GROUP_W + (GROUPS.length - 1) * GROUP_GAP;
const CENTER_X = TOTAL_W / 2;

const WRAP_X = CENTER_X - NODE_W / 2;
const RAW_X = WRAP_X - 180;
const OUTPUT_X = CENTER_X - NODE_W / 2;

// The center node of the whole diagram = middle child of the middle group = envelope.
const CENTER_TUPLED_ID = GROUPS[1].children[1];

// Tier 1 nodes
const headNodes = [
  {
    id: 'raw',
    type: 'multi',
    data: { label: 'raw oscillators' },
    position: { x: RAW_X, y: TIER_RAW_Y },
    draggable: false,
    selectable: false,
    connectable: false,
  },
  {
    id: 'wrap',
    type: 'multi',
    data: { label: wrapLabel, style: wrapStyle },
    position: { x: WRAP_X, y: TIER_RAW_Y - 6 },
    draggable: false,
    selectable: false,
    connectable: false,
  },
];

// Tier 2 group containers
const groupNodes = GROUPS.map((g, gi) => ({
  id: g.id,
  type: 'group',
  data: { label: g.label },
  position: { x: gi * (GROUP_W + GROUP_GAP), y: TIER_GROUPS_Y },
  style: { width: GROUP_W, height: GROUP_H },
  draggable: false,
  selectable: false,
  connectable: false,
  zIndex: 0,
}));

// Tier 2 children /positioned relative to their group parent/
const tupledNodes = GROUPS.flatMap((g) =>
  g.children.map((childId, ci) => {
    const meta = TUPLED_META[childId];
    return {
      id: childId,
      type: 'multi',
      parentId: g.id,
      extent: 'parent',
      data: { label: meta.label },
      position: { x: GROUP_PAD_LEFT + ci * CHILD_PITCH, y: GROUP_PAD_TOP },
      draggable: false,
      selectable: false,
      connectable: false,
    };
  })
);

// Tier 3
const outputNode = {
  id: 'output',
  type: 'multi',
  data: { label: 'output' },
  position: { x: OUTPUT_X, y: TIER_OUTPUT_Y },
  draggable: false,
  selectable: false,
  connectable: false,
};

const nodes = [...headNodes, ...groupNodes, ...tupledNodes, outputNode];

const purple = '#a78bfa';
const purpleDeep = '#7c3aed';
const gray = '#9ca3af';

const arrowDeep = { type: MarkerType.ArrowClosed, color: purpleDeep, width: 14, height: 14 };
const arrowSubtle = { type: MarkerType.ArrowClosed, color: gray, width: 10, height: 10 };
const arrowHover = { type: MarkerType.ArrowClosed, color: purple, width: 10, height: 10 };

const boldEdgeStyle = { stroke: purpleDeep, strokeWidth: 1.75 };
const subtleEdgeStyle = { stroke: gray, strokeWidth: 1, strokeOpacity: 0.4 };
const hoverEdgeStyle = { stroke: purple, strokeWidth: 1.25, strokeOpacity: 0.75 };
const boldLabelStyle = { fill: '#4b5563', fontSize: 11, fontWeight: 500 };

const baseEdges = [
  // raw → wrap /horizontal, tier 1/
  {
    id: 'e-raw-wrap',
    source: 'raw',
    target: 'wrap',
    sourceHandle: 'r-out',
    targetHandle: 'l-in',
    type: 'smoothstep',
    label: 'raw values',
    markerEnd: arrowDeep,
    style: boldEdgeStyle,
    labelStyle: boldLabelStyle,
    labelBgStyle: { fill: '#faf5ff' },
    labelBgPadding: [4, 2],
  },
  // wrap → tupled world /short vertical drop to the center primitive/
  {
    id: 'e-wrap-tupled',
    source: 'wrap',
    target: CENTER_TUPLED_ID,
    sourceHandle: 'b-out',
    targetHandle: 't-in',
    type: 'smoothstep',
    label: 'tupled',
    markerEnd: arrowDeep,
    style: boldEdgeStyle,
    labelStyle: boldLabelStyle,
    labelBgStyle: { fill: '#faf5ff' },
    labelBgPadding: [4, 2],
  },
  // wrap → output /subtle direct bypass/
  {
    id: 'e-wrap-output',
    source: 'wrap',
    target: 'output',
    sourceHandle: 'b-out',
    targetHandle: 't-in',
    type: 'smoothstep',
    markerEnd: arrowSubtle,
    style: { ...subtleEdgeStyle, strokeOpacity: 0.5 },
  },
  // Every tupled → output /subtle fan-in/
  ...tupledOrder.map((id) => ({
    id: `e-${id}-output`,
    source: id,
    target: 'output',
    sourceHandle: 'b-out',
    targetHandle: 't-in',
    type: 'smoothstep',
    markerEnd: arrowSubtle,
    style: subtleEdgeStyle,
  })),
];

function computeHoverEdges(hoveredId) {
  const i = tupledOrder.indexOf(hoveredId);
  if (i < 0) return [];
  return tupledOrder
    .filter((_, j) => j !== i)
    .map((targetId) => {
      const j = tupledOrder.indexOf(targetId);
      const goesRight = j > i;
      return {
        id: `hover-${hoveredId}-${targetId}`,
        source: hoveredId,
        target: targetId,
        sourceHandle: goesRight ? 'r-out' : 'l-out',
        targetHandle: goesRight ? 'l-in' : 'r-in',
        type: 'straight',
        markerEnd: arrowHover,
        style: hoverEdgeStyle,
        zIndex: 1000,
      };
    });
}

export const engineMain = {
  nodes,
  edges: baseEdges,
  computeHoverEdges,
  tooltips: {
    raw: 'Five stateless generators that yield plain numbers: sine, sawtooth, square, triangle, flat',
    wrap: 'Lifts a raw oscillator into the tupled world. Dispatches to modulate when given a generator frequency',
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
  height: 460,
};
