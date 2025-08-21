import { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange, readOnly = false }) {
  const editorRef = useRef(null);
  const [height, setHeight] = useState(120);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme('lyreTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#f6f8fa' }
    });
    monaco.editor.setTheme('lyreTheme');

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
          scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
          readOnly
        }}
      />
    </div>
  );
}
