/* cspell:words xyflow tupled */
import { Handle, Position, MarkerType } from '@xyflow/react';

// ————————————————————————————————————————————————
// PALETTE
// ————————————————————————————————————————————————

const FILL_PRIMITIVE = '#ddd6fe';
const FILL_WRAP = '#c4b5fd';
const FILL_OUTPUT = '#ede9fe';
const FILL_BUS = '#9ca3af';

const TEXT_PRIMITIVE = '#374151';
const TEXT_WRAP = '#2e1065';
const TEXT_OUTPUT = '#111827';
const TEXT_BUS = '#1f2937';

// ————————————————————————————————————————————————
// HEIGHT TIERS
// ————————————————————————————————————————————————

export const H_COMPACT = 40;
export const H_STANDARD = 56;
export const H_EMPHASIS = 66;
export const H_BUS = 24;

// ————————————————————————————————————————————————
// BOX STYLES
// ————————————————————————————————————————————————

export const primitiveStyle = {
  background: FILL_PRIMITIVE,
  border: 'none',
  borderRadius: 0,
  padding: '6px 10px',
  fontSize: 13,
  fontWeight: 500,
  color: TEXT_PRIMITIVE,
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const outputStyle = {
  ...primitiveStyle,
  background: FILL_OUTPUT,
  color: TEXT_OUTPUT,
};

export const wrapStyle = {
  ...primitiveStyle,
  background: FILL_WRAP,
  color: TEXT_WRAP,
  fontWeight: 600,
  flexDirection: 'column',
  lineHeight: 1.15,
};

export const busBarStyle = {
  background: FILL_BUS,
  color: TEXT_BUS,
  border: 'none',
  borderRadius: 0,
  fontFamily: 'Inter, sans-serif',
  fontWeight: 600,
  fontSize: 12,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  position: 'relative',
};

// ————————————————————————————————————————————————
// EDGE STYLES & ARROWS
// ————————————————————————————————————————————————

const PURPLE_DEEP = '#7c3aed';
const GRAY = '#9ca3af';

export const arrowDeep = { type: MarkerType.ArrowClosed, color: PURPLE_DEEP, width: 14, height: 14 };
export const arrowStub = { type: MarkerType.ArrowClosed, color: GRAY, width: 8, height: 8 };
export const boldEdgeStyle = { stroke: PURPLE_DEEP, strokeWidth: 1.75 };
export const thinEdgeStyle = { stroke: GRAY, strokeWidth: 1, strokeOpacity: 0.7 };

// ————————————————————————————————————————————————
// HANDLES
// ————————————————————————————————————————————————

export const hiddenHandle = {
  width: 6,
  height: 6,
  background: 'transparent',
  border: 'none',
  minWidth: 0,
  minHeight: 0,
};

// ————————————————————————————————————————————————
// COMPONENTS
// ————————————————————————————————————————————————

export function TwoLineLabel({ top, bottom }) {
  return (
    <div className="flex flex-col items-center leading-tight">
      <div>{top}</div>
      {bottom && (
        <div className="text-[10px] italic text-purple-700 mt-1">{bottom}</div>
      )}
    </div>
  );
}

export function MultiHandleNode({ data }) {
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

export function EdgeLabelNode({ data }) {
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
      {data.bottom && (
        <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 500 }}>{data.bottom}</div>
      )}
    </div>
  );
}

export function BusNode({ data }) {
  const { topHandles = [], bottomHandles = [], style } = data;
  return (
    <div style={{ ...busBarStyle, ...style }}>
      <Handle type="target" position={Position.Left} id="l-in" style={hiddenHandle} />
      <Handle type="source" position={Position.Right} id="r-out" style={hiddenHandle} />
      {topHandles.map((left, i) => (
        <Handle
          key={`t-${i}`}
          type="target"
          position={Position.Top}
          id={`t-${i}`}
          style={{ ...hiddenHandle, left }}
        />
      ))}
      {bottomHandles.map((left, i) => (
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

export const sharedNodeTypes = {
  multi: MultiHandleNode,
  edgeLabel: EdgeLabelNode,
  bus: BusNode,
};
