import { useState, useMemo, useCallback } from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { diagrams, nodeTypes } from './diagrams/index.js';
import { TooltipContext } from './tooltipContext.js';

export default function Flow({ slug }) {
  const diagram = diagrams[slug];
  const [hoveredId, setHoveredId] = useState(null);
  const [pillTooltip, setPillTooltip] = useState(null);

  const onNodeMouseEnter = useCallback((_evt, node) => {
    setHoveredId(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => setHoveredId(null), []);

  const edges = useMemo(() => {
    if (!diagram) return [];
    const base = diagram.edges || [];
    if (!diagram.computeHoverEdges) return base;
    const extra = diagram.computeHoverEdges(hoveredId);
    return extra.length ? [...base, ...extra] : base;
  }, [diagram, hoveredId]);

  const nodeTooltipText = useMemo(() => {
    if (!diagram || !hoveredId) return null;
    return diagram.tooltips?.[hoveredId] || null;
  }, [diagram, hoveredId]);

  const tooltipText = pillTooltip || nodeTooltipText;

  if (!diagram) {
    return <div className="text-red-600 text-sm my-6">Diagram not found: {slug}</div>;
  }

  return (
    <TooltipContext.Provider value={{ setTooltip: setPillTooltip }}>
      <div>
        <div
          style={{
            width: '100%',
            height: diagram.height || 400,
            transformOrigin: 'center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            WebkitFontSmoothing: 'antialiased',
          }}
          className={`rounded-sm transition-transform duration-1200 ease-in-out ${diagram.noZoom ? '' : 'hover:scale-[1.2]'}`}
        >
          <ReactFlow
            nodes={diagram.nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseLeave={onNodeMouseLeave}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={false}
            fitView
            fitViewOptions={{ padding: 0 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={24} size={1} color="#e9d5ff" />
          </ReactFlow>
        </div>
        <div className="mt-2 min-h-[1.5rem] text-center text-sm text-purple-700">
          {tooltipText || diagram.caption || '\u00A0'}
        </div>
      </div>
    </TooltipContext.Provider>
  );
}
