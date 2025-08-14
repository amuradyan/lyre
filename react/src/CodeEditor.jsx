import { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange, onRunTests, showRun = true }) {
  const editorRef = useRef(null);
  const [height, setHeight] = useState(120);

  const runWithCurrentValue = () => {
    const current = editorRef.current?.getValue ? editorRef.current.getValue() : value;
    onRunTests?.(current ?? '');
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme('lyreTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#f6f8fa' }
    });
    monaco.editor.setTheme('lyreTheme');
    if (showRun) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runWithCurrentValue);
    }

    const applyHeight = (h) => {
      const next = Math.max(120, Math.ceil(h || 0));
      setHeight(next);
      setTimeout(() => editor.layout(), 0);
    };

    const initialLines = (editor.getModel()?.getLineCount?.() || (value ? String(value).split('\n').length : 1));
    applyHeight(initialLines * editor.getOption(monaco.editor.EditorOption.lineHeight) + 8);

    editor.onDidContentSizeChange((e) => {
      applyHeight(e.contentHeight);
    });
  };

  useEffect(() => {
    if (!editorRef.current) {
      const lines = value ? String(value).split('\n').length : 1;
      setHeight(Math.max(120, lines * 20 + 8));
    }
  }, [value]);

  return (
    <div className="material-shadow relative">
      <Editor
        height={`${height}px`}
        defaultLanguage="javascript"
        value={value}
        onChange={(v) => onChange?.(v || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          roundedSelection: false,
          padding: { top: 4, bottom: 4 },
          automaticLayout: true,
          lineHeight: 20,
          fontFamily: 'IBM Plex Mono',
          fontLigatures: false,
          fontSize: 14,
          renderLineHighlight: 'none',
          wordWrap: 'on',
          scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
        }}
      />
      {showRun && (
        <button
          onClick={runWithCurrentValue}
          className="absolute flex items-center justify-center cursor-pointer transition-colors duration-200"
          style={{
            top: '4px', right: '4px', zIndex: 100, background: 'white', color: '#2ea043', border: '1px solid #e0e0e0', width: '24px', height: '24px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f6f8fa';
            e.currentTarget.style.borderColor = '#2ea043';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#e0e0e0';
          }}
          title="Run Tests (Ctrl+Enter)"
        >
          <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  );
}
