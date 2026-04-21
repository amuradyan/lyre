/* cspell:words modgen tupled */
import {
  primitiveStyle,
  outputStyle,
  wrapStyle,
  arrowDeep,
  boldEdgeStyle,
  H_STANDARD,
  H_EMPHASIS,
  TwoLineLabel,
} from './shared.jsx';

const H = H_STANDARD;

const twoLineBox = { ...primitiveStyle, flexDirection: 'column', lineHeight: 1.15 };

const nodes = [
  {
    id: 'fixed',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="number param" bottom="fixed frequency · e.g. 440" />,
      style: { ...twoLineBox, width: 200, height: H },
    },
    position: { x: 0, y: 40 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'modgen',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="generator param" bottom="varying frequency · e.g. (+ 440 (sine 5))" />,
      style: { ...twoLineBox, width: 260, height: H },
    },
    position: { x: 0, y: 120 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'wrap',
    type: 'multi',
    data: {
      label: 'wrap',
      style: { ...wrapStyle, width: 160, height: H_EMPHASIS },
    },
    position: { x: 360, y: 72 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'modulate',
    type: 'multi',
    data: {
      label: 'modulate',
      style: { ...primitiveStyle, width: 160, height: H, fontWeight: 600 },
    },
    position: { x: 580, y: 150 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'output',
    type: 'multi',
    data: {
      label: 'tupled signal',
      style: { ...outputStyle, width: 140, height: H },
    },
    position: { x: 800, y: 77 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-number-path',
    type: 'edgeLabel',
    data: { top: 'number path' },
    position: { x: 620, y: 92 },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'label-generator-path',
    type: 'edgeLabel',
    data: { top: 'generator path' },
    position: { x: 460, y: 180 },
    draggable: false, selectable: false, connectable: false,
  },
];

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
  bold('e-fixed-wrap', 'fixed', 'wrap'),
  bold('e-modgen-wrap', 'modgen', 'wrap'),
  bold('e-wrap-output', 'wrap', 'output'),
  bold('e-wrap-modulate', 'wrap', 'modulate', { sourceHandle: 'b-out' }),
  bold('e-modulate-output', 'modulate', 'output', { targetHandle: 'b-in' }),
];

export const bridgeWrap = {
  nodes,
  edges,
  tooltips: {
    fixed: 'A plain number. wrap dispatches to the raw oscillator directly and lifts samples into tuples.',
    modgen: 'Another tupled generator. wrap dispatches to modulate, which reads a fresh frequency per sample.',
    wrap: 'The bridge between raw and tupled worlds. Dispatches on parameter type.',
    modulate: 'The generator-path half of the bridge. Callable in its own right.',
    output: 'A tupled signal ready for the rest of the pipeline.',
  },
  height: 200,
};
