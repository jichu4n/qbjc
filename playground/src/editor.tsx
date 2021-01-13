import ace, {Ace} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import {autorun} from 'mobx';
import React, {useCallback, useRef} from 'react';
import configManager, {ConfigKey} from './config-manager';

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
      autorun(() => {
        editor.setOptions({
          fontFamily: configManager.getKey(ConfigKey.EDITOR_FONT_FAMILY),
          fontSize: `${configManager.getKey(ConfigKey.EDITOR_FONT_SIZE)}px`,
        });
        editor.setTheme(
          `ace/theme/${configManager.getKey(ConfigKey.EDITOR_THEME)}`
        );
      });
      editor.setShowPrintMargin(false);
      editor.session.setMode('ace/mode/vbscript');

      editor.setValue(configManager.currentSourceFile.content || '');
      editor.on('change', () =>
        configManager.setContent(
          configManager.currentSourceFile,
          editor.getValue()
        )
      );
      editorRef.current = editor;
      onReady(editor);
    },
    [onReady]
  );

  return <div ref={init} style={style}></div>;
}

export default Editor;
