import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {useTheme} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SaveIcon from '@material-ui/icons/Save';
import {saveAs} from 'file-saver';
import _ from 'lodash';
import CodeBracesBoxIcon from 'mdi-material-ui/CodeBracesBox';
import NodejsIcon from 'mdi-material-ui/Nodejs';
import TextBoxOutline from 'mdi-material-ui/TextBoxOutline';
import {autorun, IReactionDisposer} from 'mobx';
import * as monaco from 'monaco-editor';
import {compile, CompileResult} from 'qbjc';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import configManager, {ConfigKey} from './config-manager';

enum CompileResultType {
  MODULE = 'module',
  BUNDLE = 'bundle',
}

const COMPILE_RESULT_TYPE_SPECS = [
  {
    compileResultType: CompileResultType.MODULE,
    iconClass: TextBoxOutline,
    label: 'ES6 module',
  },
  {
    compileResultType: CompileResultType.BUNDLE,
    iconClass: NodejsIcon,
    label: 'Standalone Node.js program',
  },
] as const;

function CompileResultTypeSelect({
  value,
  onChange,
  style = {},
}: {
  value: CompileResultType;
  onChange: (newValue: CompileResultType) => void;
  style?: React.CSSProperties;
}) {
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(null);
  const onButtonClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  }, []);
  const onMenuSelect = useCallback(
    (newValue: CompileResultType) => {
      setMenuAnchor(null);
      onChange(newValue);
    },
    [onChange]
  );
  const onMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const {iconClass: IconClass, label} = _.find(COMPILE_RESULT_TYPE_SPECS, [
    'compileResultType',
    value,
  ])!;
  return (
    <>
      <Button
        startIcon={<IconClass />}
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
        onClick={onButtonClick}
        style={style}
      >
        {label}
      </Button>
      <Menu
        anchorEl={menuAnchor}
        keepMounted={true}
        open={!!menuAnchor}
        onClose={onMenuClose}
      >
        {COMPILE_RESULT_TYPE_SPECS.map(
          ({compileResultType, iconClass: IconClass, label}) => (
            <MenuItem
              key={compileResultType}
              selected={compileResultType === value}
              onClick={() => onMenuSelect(compileResultType)}
            >
              <ListItemIcon>
                <IconClass />
              </ListItemIcon>
              <Typography variant="inherit">{label}</Typography>
            </MenuItem>
          )
        )}
      </Menu>
    </>
  );
}

export default function CompileResultDialog({
  compileResult: moduleCompileResult,
  isOpen,
  onClose: _onClose,
}: {
  compileResult: CompileResult | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();

  const [compileResultType, setCompileResultType] = useState<CompileResultType>(
    CompileResultType.MODULE
  );
  const [bundleCompileResult, setBundleCompileResult] =
    useState<CompileResult | null>(null);

  const editorRef = useRef<monaco.editor.ICodeEditor | null>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const enterFullScreen = useCallback(() => {
    setIsFullScreen(true);
  }, []);
  const exitFullScreen = useCallback(() => {
    setIsFullScreen(false);
  }, []);

  const onCompileResultChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    if (!moduleCompileResult) {
      editor.setValue('');
      if (bundleCompileResult) {
        setBundleCompileResult(null);
      }
      return;
    }
    if (
      !bundleCompileResult ||
      bundleCompileResult.source !== moduleCompileResult.source
    ) {
      compile({
        source: moduleCompileResult.source,
        sourceFileName: moduleCompileResult.sourceFileName,
        enableBundling: true,
      }).then(setBundleCompileResult);
    }
    const newValue =
      (compileResultType === CompileResultType.MODULE
        ? moduleCompileResult.code
        : bundleCompileResult?.code) || '';
    if (newValue && editor.getValue() !== newValue) {
      editor.setValue(newValue);
    }
  }, [compileResultType, moduleCompileResult, bundleCompileResult]);

  useEffect(() => {
    onCompileResultChange();
  }, [onCompileResultChange]);

  const editorConfigChangeListenerDisposerRef =
    useRef<IReactionDisposer | null>(null);
  const init = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || editorRef.current || !isOpen) {
        return;
      }
      const editor = monaco.editor.create(node, {
        language: 'vb',
        automaticLayout: true,
        minimap: {enabled: false},
        theme: 'vs-dark',
        readOnly: true,
      });
      editorConfigChangeListenerDisposerRef.current = autorun(() => {
        editor.updateOptions({
          fontFamily: configManager.getKey(ConfigKey.EDITOR_FONT_FAMILY),
          fontSize: configManager.getKey(ConfigKey.EDITOR_FONT_SIZE),
        });
      });
      editor.focus();
      editorRef.current = editor;

      onCompileResultChange();
    },
    [isOpen, onCompileResultChange]
  );

  const onClose = useCallback(() => {
    if (editorConfigChangeListenerDisposerRef.current) {
      editorConfigChangeListenerDisposerRef.current();
      editorConfigChangeListenerDisposerRef.current = null;
    }
    if (editorRef.current) {
      editorRef.current.dispose();
      editorRef.current = null;
    }
    _onClose();
  }, [_onClose]);

  const onSaveClick = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const blob = new Blob([editor.getValue()], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, `${moduleCompileResult?.sourceFileName}.js`);
  }, [moduleCompileResult?.sourceFileName]);

  return (
    <Dialog
      onClose={onClose}
      open={isOpen}
      fullWidth={true}
      fullScreen={isFullScreen}
      maxWidth="lg"
    >
      <DialogTitle
        disableTypography={true}
        style={{display: 'flex', alignItems: 'center'}}
      >
        <CodeBracesBoxIcon style={{marginRight: '0.4rem'}} />
        <Typography variant="h6" style={{flexGrow: 1}}>
          Compiled code
        </Typography>
        <CompileResultTypeSelect
          value={compileResultType}
          onChange={setCompileResultType}
          style={{
            marginRight: theme.spacing(1),
          }}
        />
        <Tooltip title="Save compiled JavaScript program">
          <IconButton onClick={onSaveClick}>
            <SaveIcon />
          </IconButton>
        </Tooltip>
        {isFullScreen ? (
          <Tooltip title="Exit full screen">
            <IconButton onClick={exitFullScreen}>
              <FullscreenExitIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Full screen">
            <IconButton onClick={enterFullScreen}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        )}
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
