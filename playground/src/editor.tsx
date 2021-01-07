import ace, {Ace} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import React, {useCallback, useRef} from 'react';

function Editor({
  onInit = () => {},
  style = {},
}: {onInit?: (editor: Ace.Editor) => void; style?: React.CSSProperties} = {}) {
  const editorRef = useRef<Ace.Editor | null>(null);
  const init = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || editorRef.current) {
        return;
      }
      const editor = ace.edit(node);
      editor.setTheme('ace/theme/nord_dark');
      editor.setShowPrintMargin(false);
      editor.session.setMode('ace/mode/vbscript');
      editorRef.current = editor;
      onInit(editor);
    },
    [onInit]
  );

  return <div ref={init} style={style}></div>;
}

export default Editor;
