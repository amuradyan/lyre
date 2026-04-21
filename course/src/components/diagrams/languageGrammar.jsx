/* cspell:words Lyre tupled desugared */
import {
  primitiveStyle,
  boldEdgeStyle,
  H_COMPACT,
  H_STANDARD,
  TwoLineLabel,
} from './shared.jsx';

const twoLineBox = { ...primitiveStyle, flexDirection: 'column', lineHeight: 1.15 };

const rootStyle = {
  ...primitiveStyle,
  height: H_COMPACT,
  fontWeight: 600,
  background: '#c4b5fd',
  color: '#2e1065',
};

const ROOT_Y = 10;
const LEVEL1_Y = 90;
const LEVEL2_Y = 175;

const nodes = [
  {
    id: 'expression',
    type: 'multi',
    data: { label: 'expression', style: { ...rootStyle, width: 120 } },
    position: { x: 350, y: ROOT_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'number',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="number" bottom="440  ·  1.5" />,
      style: { ...twoLineBox, width: 140, height: H_STANDARD },
    },
    position: { x: 140, y: LEVEL1_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'name',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="name" bottom="A4  ·  sine  ·  wave" />,
      style: { ...twoLineBox, width: 180, height: H_STANDARD },
    },
    position: { x: 320, y: LEVEL1_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'array',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="array" bottom="( … )" />,
      style: { ...twoLineBox, width: 120, height: H_STANDARD },
    },
    position: { x: 560, y: LEVEL1_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'let-form',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="let-form" bottom="(let bindings body+)" />,
      style: { ...twoLineBox, width: 200, height: H_STANDARD },
    },
    position: { x: 430, y: LEVEL2_Y },
    draggable: false, selectable: false, connectable: false,
  },
  {
    id: 'call',
    type: 'multi',
    data: {
      label: <TwoLineLabel top="call" bottom="(op args*)" />,
      style: { ...twoLineBox, width: 140, height: H_STANDARD },
    },
    position: { x: 650, y: LEVEL2_Y },
    draggable: false, selectable: false, connectable: false,
  },
];

const edge = (id, source, target) => ({
  id,
  source, target,
  sourceHandle: 'b-out', targetHandle: 't-in',
  type: 'smoothstep',
  style: boldEdgeStyle,
});

const edges = [
  edge('e-exp-num', 'expression', 'number'),
  edge('e-exp-name', 'expression', 'name'),
  edge('e-exp-arr', 'expression', 'array'),
  edge('e-arr-let', 'array', 'let-form'),
  edge('e-arr-call', 'array', 'call'),
];

export const languageGrammar = {
  nodes,
  edges,
  tooltips: {
    expression: 'Every Lyre value. Either a string /number or name/ or an array /let-form or call/',
    number: 'A string that parseFloat consumes. Returned as the numeric value',
    name: 'Any other string. Looked up in the current environment, then the prelude',
    array: 'Parentheses group a sequence of expressions. First element is the operator, rest are operands',
    'let-form': 'The only special form. Binds names sequentially, evaluates bodies in the new scope',
    call: 'Function call. Evaluate operands, look up the operator, call with the evaluated args',
  },
  height: 240,
};
