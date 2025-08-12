import { useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({
  initialValue = `function factorial(n) {\n  // your code here\n}`,
  onChange,
  onRunTests
}) {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme('lyreTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#f6f8fa' }
    });
    monaco.editor.setTheme('lyreTheme');
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunTests?.();
    });
  };

  return (
    <div className="material-shadow relative">
      <Editor
        height="120px"
        defaultLanguage="javascript"
        value={initialValue}
        onChange={(value) => onChange?.(value || '')}
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
          scrollbar: { vertical: 'hidden', horizontal: 'hidden' }
        }}
      />
      <button
        onClick={onRunTests}
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
    </div>
  );
}
