import ace, {Ace} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import {autorun} from 'mobx';
import React, {useCallback, useRef} from 'react';
import configManager, {ConfigKey} from './config-manager';
import {DEFAULT_EXAMPLE} from './examples';

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

      const initialContent = configManager.currentSourceFile.content.trim()
        ? configManager.currentSourceFile.content
        : DEFAULT_EXAMPLE.content;
      editor.setValue(initialContent);
      editor.clearSelection();
      editor.moveCursorTo(0, 0);
      editor.focus();
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
