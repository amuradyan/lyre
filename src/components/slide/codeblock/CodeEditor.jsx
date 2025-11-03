import { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange, readOnly = false, language = "javascript", onCtrlClick, navigateToSymbol }) {
  const editorRef = useRef(null);
  const [height, setHeight] = useState(120);

  useEffect(() => {
    if (navigateToSymbol && editorRef.current) {
      console.log('CodeEditor: Navigating to symbol:', navigateToSymbol);
      const editor = editorRef.current;
      const model = editor.getModel();

      for (let lineNumber = 1; lineNumber <= model.getLineCount(); lineNumber++) {
        const lineContent = model.getLineContent(lineNumber);
        const functionMatch = lineContent.match(new RegExp(`^\\s*(?:export\\s+)?function\\*?\\s+${navigateToSymbol}\\s*\\(`));
        const constMatch = lineContent.match(new RegExp(`^\\s*(?:export\\s+)?const\\s+${navigateToSymbol}\\s*=`));

        if (functionMatch || constMatch) {
          console.log('Found symbol at line:', lineNumber, lineContent);
          editor.revealLineInCenter(lineNumber);
          editor.setSelection({
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: lineContent.length + 1
          });
          break;
        }
      }
    }
  }, [navigateToSymbol]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    if (onCtrlClick) {
      editor.onMouseDown((e) => {
        if ((e.event.ctrlKey || e.event.metaKey) && e.target.position) {
          const position = e.target.position;
          const model = editor.getModel();
          const lineContent = model.getLineContent(position.lineNumber);
          const word = model.getWordAtPosition(position);

          onCtrlClick({
            lineContent,
            lineNumber: position.lineNumber,
            word: word?.word || null
          });
        }
      });
    }
    monaco.editor.defineTheme('lyreTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d' },
        { token: 'comment.line.double-slash', foreground: '6a737d' },
        { token: 'comment.block', foreground: '6a737d' }
      ],
      colors: { 'editor.background': '#f6f8fa' }
    });

    monaco.editor.defineTheme('lyrePurpleTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d' },
        { token: 'keyword', foreground: '8b5cf6' },
        { token: 'string', foreground: '7c3aed' },
        { token: 'number', foreground: 'a855f7' }
      ],
      colors: { 'editor.background': '#faf5ff' }
    });

    if (language === 'scheme') {
      monaco.editor.setTheme('lyrePurpleTheme');
    } else {
      monaco.editor.setTheme('lyreTheme');
    }

    if (readOnly) {
      editor.onDidAttemptReadOnlyEdit(() => {
        monaco.editor.setModelMarkers(editor.getModel(), 'readonly', [{
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
          message: 'This code is not for editing',
          severity: monaco.MarkerSeverity.Info
        }]);

        setTimeout(() => {
          monaco.editor.setModelMarkers(editor.getModel(), 'readonly', []);
        }, 2000);
      });
    }

    const applyHeight = (h) => {
      const maxHeight = 30 * 20 + 8; // 30 lines * line height + padding
      const contentHeight = Math.ceil(h || 0);
      const extraLineHeight = contentHeight + 20; // Add one extra line
      const next = Math.min(maxHeight, extraLineHeight);
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
      const heightWithExtra = (lines + 1) * 20 + 8; // Add one extra line
      setHeight(heightWithExtra);
    }
  }, [value]);

  return (
    <div className="material-shadow relative">
      <Editor
        height={`${height}px`}
        defaultLanguage={language}
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
          scrollbar: { vertical: 'auto', horizontal: 'hidden' },
          readOnly
        }}
      />
    </div>
  );
}
