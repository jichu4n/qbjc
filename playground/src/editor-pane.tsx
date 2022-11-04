import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import {useTheme} from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import {autorun} from 'mobx';
import {observer} from 'mobx-react';
import * as monaco from 'monaco-editor';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import configManager, {ConfigKey} from './config-manager';
import EditorController from './editor-controller';
import {DEFAULT_EXAMPLE} from './examples';
import {MonacoEditorController} from './monaco-editor-interface';
import PaneHeader from './pane-header';

const SETTING_EDITOR_INPUT_WIDTH = 400;

function TextFieldEditorDialog({
  title,
  value: valueProp,
  onChange,
  isOpen,
  onClose,
}: {
  title: string;
  value: string;
  onChange: (newValue: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState(valueProp);

  // Set value to valueProp whenever it changes.
  const prevValueProp = useRef(valueProp);
  useEffect(() => {
    if (prevValueProp.current !== valueProp && value !== valueProp) {
      setValue(valueProp);
    }
    prevValueProp.current = valueProp;
  }, [value, valueProp]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers={true}>
        <TextField
          autoFocus={true}
          required={true}
          fullWidth={true}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{width: SETTING_EDITOR_INPUT_WIDTH, maxWidth: '100%'}}
          InputProps={{style: {fontSize: '0.9rem'}}}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={useCallback(() => {
            onClose();
            onChange(value);
          }, [onClose, onChange, value])}
          disabled={!value.trim()}
          color="primary"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const EditorPane = observer(
  ({
    sourceFileName,
    onChangeSourceFileName,
    onReady,
    style = {},
  }: {
    sourceFileName: string;
    onChangeSourceFileName: (sourceFileName: string) => void;
    onReady: (editorController: EditorController) => void;
    style?: React.CSSProperties;
  }) => {
    const theme = useTheme();

    const editorRef = useRef<monaco.editor.ICodeEditor | null>(null);

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
        editor.focus();
      }, 0);
    }, []);

    const init = useCallback(
      (node: HTMLDivElement | null) => {
        if (!node || editorRef.current) {
          return;
        }
        const initialContent = configManager.currentSourceFile.content.trim()
          ? configManager.currentSourceFile.content
          : DEFAULT_EXAMPLE.content;
        const editor = monaco.editor.create(node, {
          value: initialContent,
          language: 'qb',
          automaticLayout: true,
          minimap: {enabled: false},
          theme: 'vs-dark',
        });
        autorun(() => {
          editor.updateOptions({
            fontFamily: configManager.getKey(ConfigKey.EDITOR_FONT_FAMILY),
            fontSize: configManager.getKey(ConfigKey.EDITOR_FONT_SIZE),
          });
        });
        editor.onDidChangeModelContent(() => {
          configManager.setSourceFileContent(
            configManager.currentSourceFile,
            editor.getValue()
          );
        });
        editor.focus();
        editorRef.current = editor;
        onReady(new MonacoEditorController(editor));
      },
      [onReady]
    );

    const [
      isSourceFileNameEditorDialogOpen,
      setIsSourceFileNameEditorDialogOpen,
    ] = useState(false);
    const showSourceFileNameEditorDialog = useCallback(
      () => setIsSourceFileNameEditorDialogOpen(true),
      []
    );
    const hideSourceFileNameEditorDialog = useCallback(
      () => setIsSourceFileNameEditorDialogOpen(false),
      []
    );
    const [isHoveringOverSourceFileName, setIsHoveringOverSourceFileName] =
      useState(false);
    const onHoverOverSourceFileName = useCallback(
      () => setIsHoveringOverSourceFileName(true),
      []
    );
    const onLeaveSourceFileName = useCallback(
      () => setIsHoveringOverSourceFileName(false),
      []
    );

    return (
      <>
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
            title={
              <Tooltip title="Click to rename" placement="right" arrow={true}>
                <div
                  onClick={showSourceFileNameEditorDialog}
                  onMouseOver={onHoverOverSourceFileName}
                  onMouseOut={onLeaveSourceFileName}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {sourceFileName}
                  <EditIcon
                    style={{
                      fontSize: theme.typography.overline.fontSize,
                      verticalAlign: 'middle',
                      marginLeft: '4px',
                      opacity: isHoveringOverSourceFileName ? '100%' : '0',
                    }}
                  />
                </div>
              </Tooltip>
            }
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
                <IconButton onClick={exitFullScreen} size="large">
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
                <IconButton onClick={enterFullScreen} size="large">
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

        <TextFieldEditorDialog
          title="Rename source file"
          value={sourceFileName}
          onChange={onChangeSourceFileName}
          isOpen={isSourceFileNameEditorDialogOpen}
          onClose={hideSourceFileNameEditorDialog}
        />
      </>
    );
  }
);

export default EditorPane;
