import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import {useTheme} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import ace, {Ace} from 'ace-builds';
import 'ace-builds/webpack-resolver';
import CodeBracesBoxIcon from 'mdi-material-ui/CodeBracesBox';
import {autorun, IReactionDisposer} from 'mobx';
import {CompileResult} from 'qbjc';
import React, {useCallback, useEffect, useRef} from 'react';
import configManager, {ConfigKey} from './config-manager';

export default function CompileResultDialog({
  compileResult,
  isOpen,
  onClose: _onClose,
  style = {},
}: {
  compileResult: CompileResult | null;
  isOpen: boolean;
  onClose: () => void;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();

  const editorRef = useRef<Ace.Editor | null>(null);
  const editorConfigChangeListenerDisposerRef =
    useRef<IReactionDisposer | null>(null);
  const init = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || editorRef.current || !isOpen) {
        return;
      }
      const editor = ace.edit(node, {
        useWorker: false, // Disable syntax warnings
      });
      editorConfigChangeListenerDisposerRef.current = autorun(() => {
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
      if (compileResult) {
        editor.setValue(compileResult.code);
      }
      editor.setShowPrintMargin(false);
      editor.session.setMode('ace/mode/javascript');
      editor.setReadOnly(true);

      editor.clearSelection();
      editor.moveCursorTo(0, 0);
      editor.focus();
      editorRef.current = editor;
    },
    [compileResult, isOpen]
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const newValue = compileResult?.code;
    if (newValue && editor.getValue() !== newValue) {
      editor.setValue(newValue);
    }
  }, [compileResult]);

  const onClose = useCallback(() => {
    if (editorConfigChangeListenerDisposerRef.current) {
      editorConfigChangeListenerDisposerRef.current();
      editorConfigChangeListenerDisposerRef.current = null;
    }
    if (editorRef.current) {
      editorRef.current.destroy();
      editorRef.current = null;
    }
    _onClose();
  }, [_onClose]);

  return (
    <Dialog onClose={onClose} open={isOpen} fullWidth={true} maxWidth="lg">
      <DialogTitle
        disableTypography={true}
        style={{display: 'flex', alignItems: 'center'}}
      >
        <CodeBracesBoxIcon style={{marginRight: '0.4rem'}} />
        <Typography variant="h6" style={{flexGrow: 1}}>
          Compiled code
        </Typography>
        <Tooltip title="Close">
          <IconButton
            onClick={onClose}
            style={{marginRight: -theme.spacing(2)}}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent
        dividers={true}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '80vh',
          padding: 0,
        }}
      >
        <div
          ref={init}
          style={{
            // This magic combo of flexGrow, height: 0, and overflowY makes this div take up the full
            // height in the parent but prevents it from growing beyond the parent size when changing
            // lineHeight. ¯\_(ツ)_/¯
            flexGrow: 1,
            height: 0,
            // @ts-ignore
            overflowY: 'overlay',
          }}
        ></div>
      </DialogContent>
    </Dialog>
  );
}
