/* cspell:words tupled */
import {
  primitiveStyle,
  outputStyle,
  wrapStyle,
  arrowDeep,
  boldEdgeStyle,
  H_STANDARD,
  TwoLineLabel,
} from './shared.jsx';

const H = H_STANDARD;
const BASELINE_Y = 85;
const Y = BASELINE_Y - H / 2;
const LABEL_Y = BASELINE_Y - 13;

const twoLineBox = { ...primitiveStyle, flexDirection: 'column', lineHeight: 1.15 };

const nodes = [
  {
    id: 'raw',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="raw.sine" bottom="440 Hz" />,
      style: { ...twoLineBox, width: 120, height: H },
    },
    position: { x: 0, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'wrap',
    type: 'multi',
    data: {
      label: 'wrap',
      style: { ...wrapStyle, width: 90, height: H },
    },
    position: { x: 195, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'gate',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="gate" bottom="1.5 s" />,
      style: { ...twoLineBox, width: 110, height: H },
    },
    position: { x: 360, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'env',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="envelope" bottom="A 0.01 · D 0.4 · S 0 · R 0.5" />,
      style: { ...twoLineBox, width: 220, height: H },
    },
    position: { x: 545, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'output',
    type: 'multi',
    data: {
      label: 'output',
      style: { ...outputStyle, width: 80, height: H },
    },
    position: { x: 840, y: Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-raw-wrap',
    type: 'edgeLabel',
    data: { top: 'raw', bottom: 'signal' },
    position: { x: 138, y: LABEL_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-wrap-gate',
    type: 'edgeLabel',
    data: { top: 'tupled', bottom: 'infinite' },
    position: { x: 301, y: LABEL_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-gate-env',
    type: 'edgeLabel',
    data: { top: 'tupled', bottom: '1.5 s' },
    position: { x: 486, y: LABEL_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-env-output',
    type: 'edgeLabel',
    data: { top: 'tupled', bottom: 'shaped' },
    position: { x: 781, y: LABEL_Y },
    draggable: false, selectable: false, connectable: false,
  },
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
  bold('e-raw-wrap', 'raw', 'wrap'),
  bold('e-wrap-gate', 'wrap', 'gate'),
  bold('e-gate-env', 'gate', 'env'),
  bold('e-env-output', 'env', 'output'),
];

export const pluck = {
  nodes,
  edges,
  tooltips: {
    raw: 'raw.sine yields plain numbers for a 440 Hz sine wave',
    wrap: 'Lifts raw samples into the tupled format',
    gate: 'Time-boxes the signal to 1.5 seconds',
    env: 'ADSR amplitude shaping over the gated duration',
    output: 'Samples consumed by the audio worklet',
  },
  height: 80,
};
