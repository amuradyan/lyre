import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRunTests: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, onRunTests }) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Define custom theme
    monaco.editor.defineTheme('lyreTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#f6f8fa',
      }
    });

    // Set the theme
    monaco.editor.setTheme('lyreTheme');

    // Add keyboard shortcut for running tests
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunTests();
    });
  };

  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="material-shadow relative mb-6">
      <Editor
        height="150px"
        defaultLanguage="javascript"
        value={code}
        onChange={handleChange}
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
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto'
          }
        }}
      />
      <button
        onClick={onRunTests}
        className="absolute top-1 right-1 z-10 bg-white text-green-600 border border-gray-300 w-6 h-6 flex items-center justify-center cursor-pointer transition-colors duration-200 rounded-sm hover:bg-gray-50 hover:border-green-600"
        title="Run Tests (Ctrl/Cmd + Enter)"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </div>
  );
};

export default CodeEditor;
