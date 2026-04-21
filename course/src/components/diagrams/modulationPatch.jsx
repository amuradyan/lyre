/* cspell:words tupled sawtooth lowpass */
import {
  primitiveStyle,
  outputStyle,
  arrowDeep,
  arrowStub,
  boldEdgeStyle,
  thinEdgeStyle,
  H_STANDARD,
  H_EMPHASIS,
  TwoLineLabel,
} from './shared.jsx';

// Layout: two parallel rows /CV up top, audio down bottom/ converging at lowpass
const H = H_STANDARD;
const CV_BASELINE = 45;
const AUDIO_BASELINE = 205;
const LP_BASELINE = 135;
const CV_Y = CV_BASELINE - H / 2;     // 17
const AUDIO_Y = AUDIO_BASELINE - H / 2; // 177
const LP_Y = LP_BASELINE - H_EMPHASIS / 2; // 102
const OUTPUT_Y = LP_BASELINE - H / 2;      // 107

const twoLineBox = { ...primitiveStyle, height: H, flexDirection: 'column', lineHeight: 1.15 };

const nodes = [
  // CV path
  {
    id: 'flat',
    type: 'multi',
    data: { label: <TwoLineLabel top="flat 1" bottom="DC source" />, style: { ...twoLineBox, width: 90 } },
    position: { x: 0, y: CV_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'g1',
    type: 'multi',
    data: { label: <TwoLineLabel top="gate" bottom="1 s" />, style: { ...twoLineBox, width: 80 } },
    position: { x: 110, y: CV_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'env',
    type: 'multi',
    data: { label: <TwoLineLabel top="envelope" bottom="A 0 · D 0 · S 1 · R 1" />, style: { ...twoLineBox, width: 200 } },
    position: { x: 210, y: CV_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'mul',
    type: 'multi',
    data: { label: <TwoLineLabel top="× 2500" bottom="depth" />, style: { ...twoLineBox, width: 90 } },
    position: { x: 430, y: CV_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'add',
    type: 'multi',
    data: { label: <TwoLineLabel top="+ 500" bottom="offset" />, style: { ...twoLineBox, width: 90 } },
    position: { x: 540, y: CV_Y },
    draggable: false, selectable: false, connectable: false,
  },

  // Audio path
  {
    id: 'saw',
    type: 'multi',
    data: { label: <TwoLineLabel top="sawtooth" bottom="220 Hz" />, style: { ...twoLineBox, width: 110 } },
    position: { x: 0, y: AUDIO_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'g2',
    type: 'multi',
    data: { label: <TwoLineLabel top="gate" bottom="1 s" />, style: { ...twoLineBox, width: 80 } },
    position: { x: 130, y: AUDIO_Y },
    draggable: false, selectable: false, connectable: false,
  },

  // Convergence
  {
    id: 'lp',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="lowpass" bottom="cutoff · source" />,
      style: { ...primitiveStyle, width: 160, height: H_EMPHASIS, flexDirection: 'column', lineHeight: 1.15, fontWeight: 600 },
    },
    position: { x: 680, y: LP_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'output',
    type: 'multi',
    data: { label: 'output', style: { ...outputStyle, width: 90, height: H } },
    position: { x: 930, y: OUTPUT_Y },
    draggable: false, selectable: false, connectable: false,
  },

  // Edge labels — centered on their edge midpoints
  {
    id: 'label-cutoff',
    type: 'edgeLabel',
    data: { top: 'cutoff CV' },
    position: { x: 668, y: 60 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-source',
    type: 'edgeLabel',
    data: { top: 'source' },
    position: { x: 467, y: 174 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-tupled',
    type: 'edgeLabel',
    data: { top: 'tupled', bottom: 'signal' },
    position: { x: 863, y: 122 },
    draggable: false, selectable: false, connectable: false,
  },
];

const thin = (id, source, target, extra = {}) => ({
  id,
  source, target,
  sourceHandle: 'r-out', targetHandle: 'l-in',
  type: 'smoothstep',
  markerEnd: arrowStub,
  style: thinEdgeStyle,
  ...extra,
});

const bold = (id, source, target, extra = {}) => ({
  id,
  source, target,
  sourceHandle: 'r-out', targetHandle: 'l-in',
  type: 'smoothstep',
  markerEnd: arrowDeep,
  style: boldEdgeStyle,
  ...extra,
});

const edges = [
  thin('e-flat-g1', 'flat', 'g1'),
  thin('e-g1-env', 'g1', 'env'),
  thin('e-env-mul', 'env', 'mul'),
  thin('e-mul-add', 'mul', 'add'),
  thin('e-add-lp', 'add', 'lp', { targetHandle: 't-in' }),
  bold('e-saw-g2', 'saw', 'g2'),
  bold('e-g2-lp', 'g2', 'lp', { targetHandle: 'b-in' }),
  bold('e-lp-output', 'lp', 'output'),
];

export const modulationPatch = {
  nodes,
  edges,
  tooltips: {
    flat: 'DC source: yields a constant 1 forever',
    g1: 'Time-boxes the DC source to 1 second',
    env: 'ADSR ramps the gate from 0 to 1 over its duration',
    mul: 'Scales the 0-to-1 curve to 0-to-2500',
    add: 'Offsets the scaled curve by 500, yielding 500 to 3000',
    saw: 'A 220 Hz sawtooth - the tone the filter will sweep',
    g2: 'Time-boxes the sawtooth to 1 second',
    lp: 'Low-pass filter. cutoff is modulated by the CV, source carries the audio',
    output: 'Samples consumed by the audio worklet',
  },
  height: 230,
};
