import { useState, useEffect, useMemo, useRef } from 'react';
import mermaid from 'mermaid';
import { parseMarkdown } from '../toolbox/slides/slideParser.js';
import LyreCodeblock from './slide/codeblock/LyreCodeblock.jsx';
import PlayableLyreJsCodeblock from './slide/codeblock/PlayableLyreJsCodeblock.jsx';
import Flow from './Flow.jsx';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#faf5ff',
    primaryBorderColor: '#c4b5fd',
    primaryTextColor: '#374151',
    lineColor: '#6b7280',
    secondaryColor: '#f5f3ff',
    tertiaryColor: '#faf5ff',
    edgeLabelBackground: 'transparent',
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
  },
  themeCSS: `
    .edgeLabel, .edgeLabel p, .edgeLabel span, .edgeLabel div, .edgeLabel foreignObject > div {
      background-color: transparent !important;
      background: transparent !important;
    }
    .edgeLabel > rect, rect.labelBkg {
      fill: none !important;
      stroke: none !important;
    }
  `,
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    nodeSpacing: 40,
    rankSpacing: 70,
    diagramPadding: 8,
  },
});

function joinUrlFs(path) {
  const isDev = import.meta.env.DEV;

  if (isDev) {
    if (path.startsWith('/')) {
      return encodeURI(`/@fs${path}`);
    }
    const upMatch = path.match(/^((?:\.\.\/)+)/);
    const upCount = upMatch ? upMatch[1].length / 3 : 0;
    const rest = path.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
    const rootParts = __WORKSPACE_ROOT__.split('/');
    const base = rootParts.slice(0, rootParts.length - upCount).join('/');
    const absolutePath = `${base}/${rest}`;
    return encodeURI(`/@fs${absolutePath}`);
  } else {
    if (path.startsWith('../lang/')) {
      return encodeURI(`/lang-docs/${path.slice('../lang/'.length)}`);
    }
    return encodeURI(path);
  }
}

let mermaidIdCounter = 0;

function extractTooltips(chart) {
  const map = new Map();
  const regex = /click\s+(\w+)\s+call\s+\w+\(\)\s+"([^"]+)"/g;
  let m;
  while ((m = regex.exec(chart)) !== null) {
    map.set(m[1], m[2]);
  }
  return map;
}

function stripClickDirectives(chart) {
  return chart.replace(/^\s*click\s+\w+\s+call\s+\w+\(\)\s+"[^"]*"\s*$\n?/gm, '');
}

function Mermaid({ chart }) {
  const tooltips = useMemo(() => extractTooltips(chart), [chart]);
  const cleanChart = useMemo(() => stripClickDirectives(chart), [chart]);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const id = `mermaid-${mermaidIdCounter++}`;
    mermaid
      .render(id, cleanChart)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [cleanChart]);

  useEffect(() => {
    if (!svg || !containerRef.current || tooltips.size === 0) return;
    const container = containerRef.current;
    const nodes = container.querySelectorAll('g.node');
    const bindings = [];
    nodes.forEach((node) => {
      const match = node.id?.match(/-([^-]+)-\d+$/);
      if (!match) return;
      const nodeId = match[1];
      const tooltip = tooltips.get(nodeId);
      if (!tooltip) return;
      node.style.cursor = 'help';
      const onEnter = () => setHovered(tooltip);
      const onLeave = () => setHovered(null);
      node.addEventListener('mouseenter', onEnter);
      node.addEventListener('mouseleave', onLeave);
      bindings.push([node, onEnter, onLeave]);
    });
    return () => {
      bindings.forEach(([n, e, l]) => {
        n.removeEventListener('mouseenter', e);
        n.removeEventListener('mouseleave', l);
      });
    };
  }, [svg, tooltips]);

  if (error) return <div className="text-red-600 text-sm my-6">Diagram error: {error}</div>;
  if (!svg) return <div className="text-gray-400 text-sm italic my-6">rendering diagram…</div>;

  return (
    <div className="my-6">
      <div
        ref={containerRef}
        className="flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {tooltips.size > 0 && (
        <div className="mt-2 min-h-[1.5rem] text-center text-sm text-purple-700">
          {hovered || '\u00A0'}
        </div>
      )}
    </div>
  );
}

function Html({ html }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderBlock(item, i) {
  switch (item.type) {
    case 'header': {
      const Tag = `h${item.level}`;
      const cls =
        item.level === 1
          ? 'text-3xl font-bold text-gray-900 mt-8 mb-6'
          : item.level === 2
            ? 'text-xl font-semibold text-gray-800 mt-6 mb-4'
            : item.level === 3
              ? 'text-lg font-medium text-gray-700 mt-4 mb-3'
              : 'text-base font-medium text-gray-600 mt-3 mb-2';
      return (
        <Tag key={i} className={cls}>
          <Html html={item.text} />
        </Tag>
      );
    }
    case 'paragraph':
      return (
        <p key={i} className="text-gray-700">
          <Html html={item.content} />
        </p>
      );
    case 'list': {
      const Tag = item.ordered ? 'ol' : 'ul';
      const listCls = item.ordered
        ? 'list-decimal list-inside space-y-1 ml-8 text-gray-700'
        : 'list-disc list-inside space-y-1 ml-8 text-gray-700';
      return (
        <Tag key={i} className={listCls}>
          {item.items.map((li, j) => (
            <li key={j}>
              <Html html={li} />
            </li>
          ))}
        </Tag>
      );
    }
    case 'blockquote':
      return (
        <blockquote
          key={i}
          className="border-l-4 border-purple-300 pl-4 italic text-gray-600"
        >
          <p>
            <Html html={item.content} />
          </p>
        </blockquote>
      );
    case 'indented':
      return (
        <div
          key={i}
          className="ml-8 text-gray-700 whitespace-pre-line font-mono text-sm"
        >
          <Html html={item.content} />
        </div>
      );
    case 'hr':
      return <hr key={i} className="border-gray-300 my-6" />;
    case 'image':
      return (
        <img
          key={i}
          src={item.src}
          alt={item.alt || ''}
          className="max-w-full h-auto my-6 mx-auto block"
        />
      );
    case 'codeblock':
      return renderCodeblockItem(item, i);
    case 'codeblock-group':
      return (
        <div key={i} className="flex flex-col md:flex-row gap-4 items-start my-6">
          {item.blocks.map((block, j) => (
            <div key={j} className="flex-1 min-w-0 w-full">
              <div className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-wide">
                {columnLabel(block.language)}
              </div>
              {renderCodeblockItem(block, j)}
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function columnLabel(language) {
  if (language === 'lyre' || language === 'lisp') return 'Lyre';
  if (language === 'javascript') return 'JS';
  return language || '';
}

function renderCodeblockItem(item, i) {
  if (item.language === 'flow') {
    return <Flow key={i} slug={item.code.trim()} />;
  }
  if (item.language === 'mermaid') {
    return <Mermaid key={i} chart={item.code} />;
  }
  if (item.language === 'lyre' || item.language === 'lisp') {
    return <LyreCodeblock key={i} code={item.code} showContainer={true} />;
  }
  if (item.language === 'javascript') {
    return <PlayableLyreJsCodeblock key={i} code={item.code} />;
  }
  return (
    <pre
      key={i}
      className="bg-white/60 border border-purple-100 p-3 text-xs overflow-x-auto font-mono rounded-sm"
    >
      <code>{item.code}</code>
    </pre>
  );
}

export default function DocContent({ markdownPath }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(joinUrlFs(markdownPath));
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const text = await res.text();
        if (!cancelled) setContent(text);
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [markdownPath]);

  const parsed = useMemo(() => parseMarkdown(content || ''), [content]);

  useEffect(() => {
    if (!loading && !error && rootRef.current) {
      const top = rootRef.current.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [loading, error, markdownPath]);

  if (loading) return <div className="text-gray-500">Loading…</div>;
  if (error) return <div className="text-red-600">Error loading doc: {error}</div>;

  return (
    <div ref={rootRef} className="max-w-3xl mx-auto">
      {parsed.title && (
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{parsed.title}</h1>
      )}
      <div className="space-y-6 text-left">
        {parsed.content.map(renderBlock)}
      </div>
    </div>
  );
}
