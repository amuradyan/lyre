/* cspell:words tupled desugared */
import {
  primitiveStyle,
  outputStyle,
  arrowDeep,
  boldEdgeStyle,
  H_STANDARD,
  H_COMPACT,
} from './shared.jsx';

const ROOT_Y = 10;
const DECISION_Y = 100;
const LEAF_Y = 200;

const box = { ...primitiveStyle, height: H_COMPACT };
const emphasizedBox = {
  ...primitiveStyle,
  height: H_COMPACT,
  fontWeight: 600,
  background: '#c4b5fd',
  color: '#2e1065',
};

const terminalStyle = { ...outputStyle, height: H_COMPACT };

const nodes = [
  {
    id: 'root',
    type: 'multi',
    data: { label: 'expression', style: { ...emphasizedBox, width: 120 } },
    position: { x: 340, y: ROOT_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'string-check',
    type: 'multi',
    data: { label: 'parseFloat(expr)', style: { ...box, width: 150 } },
    position: { x: 130, y: DECISION_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'array-check',
    type: 'multi',
    data: { label: 'first = "let"?', style: { ...box, width: 150 } },
    position: { x: 520, y: DECISION_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'number',
    type: 'multi',
    data: { label: 'return number', style: { ...terminalStyle, width: 130 } },
    position: { x: 10, y: LEAF_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'lookup',
    type: 'multi',
    data: { label: 'lookup(expr, env)', style: { ...terminalStyle, width: 170 } },
    position: { x: 170, y: LEAF_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'let-form',
    type: 'multi',
    data: { label: 'bind · eval bodies', style: { ...terminalStyle, width: 170 } },
    position: { x: 390, y: LEAF_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'call-form',
    type: 'multi',
    data: { label: 'eval args · lookup op · call', style: { ...terminalStyle, width: 240 } },
    position: { x: 590, y: LEAF_Y },
    draggable: false, selectable: false, connectable: false,
  },

  // Edge labels — path names sitting above each split
  { id: 'lbl-string', type: 'edgeLabel', data: { top: 'string' },
    position: { x: 238, y: 60 }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-array', type: 'edgeLabel', data: { top: 'array' },
    position: { x: 555, y: 60 }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-num', type: 'edgeLabel', data: { top: 'success' },
    position: { x: 90, y: 160 }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-nan', type: 'edgeLabel', data: { top: 'NaN' },
    position: { x: 230, y: 160 }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-let', type: 'edgeLabel', data: { top: 'let' },
    position: { x: 468, y: 160 }, draggable: false, selectable: false, connectable: false },
  { id: 'lbl-other', type: 'edgeLabel', data: { top: 'other' },
    position: { x: 660, y: 160 }, draggable: false, selectable: false, connectable: false },
];

const edge = (id, source, target, sourceHandle, targetHandle) => ({
  id,
  source, target,
  sourceHandle, targetHandle,
  type: 'smoothstep',
  markerEnd: arrowDeep,
  style: boldEdgeStyle,
});

const edges = [
  edge('e-root-string', 'root', 'string-check', 'b-out', 't-in'),
  edge('e-root-array', 'root', 'array-check', 'b-out', 't-in'),
  edge('e-string-number', 'string-check', 'number', 'b-out', 't-in'),
  edge('e-string-lookup', 'string-check', 'lookup', 'b-out', 't-in'),
  edge('e-array-let', 'array-check', 'let-form', 'b-out', 't-in'),
  edge('e-array-call', 'array-check', 'call-form', 'b-out', 't-in'),
];

export const languageEvaluator = {
  nodes,
  edges,
  tooltips: {
    root: 'Every expression is either a string or an array. That single fork drives the whole evaluator',
    'string-check': 'Try parseFloat. If it succeeds, return the number literal',
    'array-check': 'Arrays are either the let special form or a function call',
    number: 'Numeric literal. Returned unchanged',
    lookup: 'Searches env then the prelude. Works for note names, defaults, and function values',
    'let-form': 'The only special form. Binds names sequentially, evaluates bodies in the new scope',
    'call-form': 'Evaluate each operand, look up the operator, call it with the evaluated args',
  },
  height: 260,
};
