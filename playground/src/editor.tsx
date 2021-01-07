import ace, {Ace} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import React, {useCallback, useRef} from 'react';

function Editor({style = {}}: {style?: React.CSSProperties} = {}) {
  const editorRef = useRef<Ace.Editor | null>(null);
  const onRender = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }
    const editor = ace.edit(node);
    editor.setTheme('ace/theme/nord_dark');
    editor.setShowPrintMargin(false);
    editor.session.setMode('ace/mode/vbscript');
    editorRef.current = editor;
  }, []);

  return (
    <div ref={onRender} style={{height: '100%', minWidth: 400, ...style}}></div>
  );
}

export default Editor;
