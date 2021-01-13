import ace, {Ace} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import React, {useCallback, useRef} from 'react';
import configManager from './config-manager';

function Editor({
  onReady = () => {},
  style = {},
}: {onReady?: (editor: Ace.Editor) => void; style?: React.CSSProperties} = {}) {
  const editorRef = useRef<Ace.Editor | null>(null);
  const init = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || editorRef.current) {
        return;
      }
      const editor = ace.edit(node);
      editor.setTheme('ace/theme/nord_dark');
      editor.setOptions({
        fontFamily: 'Cascadia Mono',
        fontSize: '12px',
      });
      editor.setShowPrintMargin(false);
      editor.session.setMode('ace/mode/vbscript');

      editor.setValue(configManager.currentSourceFile.content || '');
      editor.on('change', () =>
        configManager.updateCurrentSourceFileContent(editor.getValue())
      );
      editorRef.current = editor;
      onReady(editor);
    },
    [onReady]
  );

  return <div ref={init} style={style}></div>;
}

export default Editor;
