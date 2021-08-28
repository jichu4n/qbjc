import IconButton from '@material-ui/core/IconButton';
import {useTheme} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import DescriptionIcon from '@material-ui/icons/Description';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import ace, {Ace} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import {autorun} from 'mobx';
import React, {useCallback, useRef, useState} from 'react';
import configManager, {ConfigKey} from './config-manager';
import {DEFAULT_EXAMPLE} from './examples';
import PaneHeader from './pane-header';

function EditorPane({
  onReady = () => {},
  style = {},
}: {onReady?: (editor: Ace.Editor) => void; style?: React.CSSProperties} = {}) {
  const theme = useTheme();

  const editorRef = useRef<Ace.Editor | null>(null);

  const containerElRef = useRef<HTMLDivElement | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerHeightBeforeFullScreenRef = useRef<string | null>(null);
  const enterFullScreen = useCallback(() => {
    const containerEl = containerElRef.current;
    const editor = editorRef.current;
    if (!containerEl || !editor) {
      return;
    }
    containerHeightBeforeFullScreenRef.current = containerEl.style.height;
    setIsFullScreen(true);
    setTimeout(() => {
      editor.resize(true);
      editor.focus();
    }, 0);
  }, []);
  const exitFullScreen = useCallback(() => {
    const containerEl = containerElRef.current;
    const editor = editorRef.current;
    if (!containerEl || !editor) {
      return;
    }
    setIsFullScreen(false);
    setTimeout(() => {
      const containerHeightBeforeFullScreen =
        containerHeightBeforeFullScreenRef.current;
      if (containerHeightBeforeFullScreen) {
        containerEl.style.height = containerHeightBeforeFullScreen;
        containerHeightBeforeFullScreenRef.current = null;
      }
      editor.resize(true);
      editor.focus();
    }, 0);
  }, []);

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
        const keybindings = configManager.getKey(ConfigKey.EDITOR_KEYBINDINGS);
        editor.setKeyboardHandler(
          keybindings ? `ace/keyboard/${keybindings}` : ''
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

  return (
    <div
      ref={containerElRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style,
        ...(isFullScreen
          ? {
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              // Must be greater than z-index of AppBar (1100) and less than
              // z-index of tooltip (1500).
              //
              // See https://material-ui.com/customization/z-index/
              zIndex: 1200,
            }
          : {}),
      }}
    >
      <PaneHeader
        title="Editor"
        icon={
          <DescriptionIcon
            style={{
              fontSize: theme.typography.overline.fontSize,
            }}
          />
        }
      >
        {isFullScreen ? (
          <Tooltip title="Exit full screen">
            <IconButton onClick={exitFullScreen}>
              <FullscreenExitIcon
                style={{
                  fontSize: theme.typography.overline.fontSize,
                  color: theme.palette.text.secondary,
                }}
              />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Full screen">
            <IconButton onClick={enterFullScreen}>
              <FullscreenIcon
                style={{
                  fontSize: theme.typography.overline.fontSize,
                  color: theme.palette.text.secondary,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </PaneHeader>
      <div
        ref={init}
        style={{
          // This magic combo of flexGrow, height: 0, and overflowY makes this div take up the full
          // height in the parent but prevents it from growing beyond the parent size.
          flexGrow: 1,
          height: 0,
          // @ts-ignore
          overflowY: 'overlay',
        }}
      ></div>
    </div>
  );
}

export default EditorPane;
