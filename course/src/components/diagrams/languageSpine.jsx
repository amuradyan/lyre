/* cspell:words desugar tupled lowpass desugared */
import {
  primitiveStyle,
  outputStyle,
  arrowDeep,
  boldEdgeStyle,
  H_STANDARD,
} from './shared.jsx';

const H = H_STANDARD;
const BASELINE_Y = 85;
const Y = BASELINE_Y - H / 2;
const LABEL_Y = BASELINE_Y - 13;

const twoLineBox = { ...primitiveStyle, flexDirection: 'column', lineHeight: 1.15 };

const codeStyle = {
  fontFamily: 'JetBrains Mono, IBM Plex Mono, monospace',
  fontSize: 10,
  color: '#6b21a8',
  marginTop: 4,
  whiteSpace: 'nowrap',
};

function StageLabel({ stage, value }) {
  return (
    <div className="flex flex-col items-center leading-tight">
      <div>{stage}</div>
      <div style={codeStyle}>{value}</div>
    </div>
  );
}

function SpeakerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6b21a8"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 L6 9 H2 v6 h4 l5 4 Z" />
      <path d="M15.54 8.46 a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93 a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

const nodes = [
  {
    id: 'source',
    type: 'multi',
    data: {
      label: <StageLabel stage="source" value=".C4" />,
      style: { ...twoLineBox, width: 90, height: H },
    },
    position: { x: 0, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'tokens',
    type: 'multi',
    data: {
      label: <StageLabel stage="tokens" value={`[".C4"]`} />,
      style: { ...twoLineBox, width: 100, height: H },
    },
    position: { x: 170, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'desugared',
    type: 'multi',
    data: {
      label: <StageLabel stage="desugared" value={`[["play","1","C4"]]`} />,
      style: { ...twoLineBox, width: 180, height: H },
    },
    position: { x: 350, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'evaluator',
    type: 'multi',
    data: {
      label: <StageLabel stage="evaluator" value="play(1, 261.63)" />,
      style: { ...twoLineBox, width: 160, height: H, fontWeight: 600 },
    },
    position: { x: 610, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'generator',
    type: 'multi',
    data: {
      label: <StageLabel stage="generator" value="[0.02, 0, …]" />,
      style: { ...twoLineBox, width: 130, height: H },
    },
    position: { x: 850, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'speaker',
    type: 'multi',
    data: {
      label: <SpeakerIcon />,
      style: { ...outputStyle, width: 60, height: H },
    },
    position: { x: 1060, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  { id: 'lbl-1-2', type: 'edgeLabel', data: { top: 'tokenize' },
    position: { x: 103, y: LABEL_Y }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-2-3', type: 'edgeLabel', data: { top: 'desugar' },
    position: { x: 289, y: LABEL_Y }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-3-4', type: 'edgeLabel', data: { top: 'evaluate' },
    position: { x: 553, y: LABEL_Y }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-4-5', type: 'edgeLabel', data: { top: 'run' },
    position: { x: 798, y: LABEL_Y }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-5-6', type: 'edgeLabel', data: { top: 'worklet' },
    position: { x: 998, y: LABEL_Y }, draggable: false, selectable: false, connectable: false },
];

const bold = (id, source, target) => ({
  id,
  source, target,
  sourceHandle: 'r-out', targetHandle: 'l-in',
  type: 'smoothstep',
  markerEnd: arrowDeep,
  style: boldEdgeStyle,
});

const edges = [
  bold('e-1', 'source', 'tokens'),
  bold('e-2', 'tokens', 'desugared'),
  bold('e-3', 'desugared', 'evaluator'),
  bold('e-4', 'evaluator', 'generator'),
  bold('e-5', 'generator', 'speaker'),
];

export const languageSpine = {
  nodes,
  edges,
  tooltips: {
    source: 'The user-typed Lyre code, a plain string',
    tokens: 'Tokenizer output: nested arrays of strings. Parentheses group, whitespace separates',
    desugared: 'Sugar-expanded tokens. .C4 became (play 1 C4); everything else is unchanged',
    evaluator: 'Looks up play in the prelude, evaluates each operand (1 stays numeric, C4 resolves to 261.63), and calls play with the evaluated args',
    generator: 'A JavaScript generator yielding [sample, n, totalSamples] tuples',
    speaker: 'The audio worklet consumes samples and streams them to the speakers',
  },
  height: 100,
};
