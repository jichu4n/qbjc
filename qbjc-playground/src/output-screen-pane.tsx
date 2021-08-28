import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import {useTheme} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import BlockIcon from '@material-ui/icons/Block';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import _ from 'lodash';
import MonitorIcon from 'mdi-material-ui/Monitor';
import {autorun} from 'mobx';
import {observer} from 'mobx-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import * as XtermWebfont from 'xterm-webfont';
import 'xterm/css/xterm.css';
import configManager, {ConfigKey} from './config-manager';
import PaneHeader from './pane-header';

const OutputScreenPane = observer(
  ({
    isRunning,
    onReady = () => {},
    style = {},
    dimensions = null,
  }: {
    isRunning: boolean;
    onReady?: (terminal: Terminal) => void;
    style?: React.CSSProperties;
    dimensions?: any;
  }) => {
    const theme = useTheme();

    const terminalRef = useRef<Terminal | null>(null);
    const fitAddOnRef = useRef<FitAddon | null>(null);

    const containerElRef = useRef<HTMLDivElement | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const containerHeightBeforeFullScreenRef = useRef<string | null>(null);
    const enterFullScreen = useCallback(() => {
      const containerEl = containerElRef.current;
      const terminal = terminalRef.current;
      const fitAddOn = fitAddOnRef.current;
      if (!containerEl || !terminal || !fitAddOn) {
        return;
      }
      containerHeightBeforeFullScreenRef.current = containerEl.style.height;
      console.log(
        `Saving height: ${containerHeightBeforeFullScreenRef.current}`
      );
      setIsFullScreen(true);
      setTimeout(() => {
        fitAddOn.fit();
        terminal.focus();
      }, 0);
    }, []);
    const exitFullScreen = useCallback(() => {
      const containerEl = containerElRef.current;
      const terminal = terminalRef.current;
      const fitAddOn = fitAddOnRef.current;
      if (!containerEl || !terminal || !fitAddOn) {
        return;
      }
      setIsFullScreen(false);
      setTimeout(() => {
        const containerHeightBeforeFullScreen =
          containerHeightBeforeFullScreenRef.current;
        if (containerHeightBeforeFullScreen) {
          console.log(
            `Restoring height: ${containerHeightBeforeFullScreenRef.current}`
          );
          containerEl.style.height = containerHeightBeforeFullScreen;
          containerHeightBeforeFullScreenRef.current = null;
        }
        fitAddOn.fit();
        terminal.focus();
      }, 0);
    }, []);

    const init = useCallback(
      async (node: HTMLDivElement | null) => {
        if (!node || terminalRef.current) {
          return;
        }
        const terminal = new Terminal({
          // Output from compiled program will only specify \n for new lines, which need to be
          // translated to \r\n.
          convertEol: true,
          // Must set initial font family to allow xterm-webfont to wait for this
          // font to load.
          fontFamily: configManager.getKey(ConfigKey.SCREEN_FONT_FAMILY),
        });
        terminalRef.current = terminal;
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.loadAddon(new XtermWebfont());
        // @ts-ignore: method added by xterm-webfont addon
        await terminal.loadWebfontAndOpen(node);
        autorun(() => {
          terminal.setOption(
            'fontFamily',
            configManager.getKey(ConfigKey.SCREEN_FONT_FAMILY)
          );
          terminal.setOption(
            'fontSize',
            configManager.getKey(ConfigKey.SCREEN_FONT_SIZE)
          );
          terminal.setOption(
            'letterSpacing',
            configManager.getKey(ConfigKey.SCREEN_LETTER_SPACING)
          );
          terminal.setOption(
            'lineHeight',
            configManager.getKey(ConfigKey.SCREEN_LINE_HEIGHT)
          );
          fitAddon.fit();
        });
        window.addEventListener(
          'resize',
          _.debounce(() => fitAddon.fit(), 200)
        );
        terminal.onResize(({rows, cols}) =>
          console.log(`Resized terminal to ${cols}x${rows}`)
        );
        fitAddOnRef.current = fitAddon;
        onReady(terminal);
      },
      [onReady]
    );
    const prevDimensionsJson = useRef('');
    const dimensionsJson = JSON.stringify(dimensions);
    useEffect(() => {
      if (
        prevDimensionsJson.current === dimensionsJson ||
        !terminalRef.current ||
        !fitAddOnRef.current
      ) {
        return;
      }
      fitAddOnRef.current.fit();
      prevDimensionsJson.current = dimensionsJson;
    }, [dimensionsJson]);

    return (
      <div
        ref={containerElRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.paper,
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
          title="Output"
          icon={
            <MonitorIcon
              style={{
                fontSize: theme.typography.overline.fontSize,
              }}
            />
          }
        >
          {isRunning ? (
            <div style={{marginRight: 12, paddingTop: 8, paddingBottom: 8}}>
              <Tooltip title="Running program...">
                <CircularProgress color="inherit" size={10} />
              </Tooltip>
            </div>
          ) : (
            <Tooltip title="Clear output">
              <IconButton onClick={() => terminalRef.current?.reset()}>
                <BlockIcon
                  style={{
                    fontSize: theme.typography.overline.fontSize,
                    color: theme.palette.text.secondary,
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
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
            // height in the parent but prevents it from growing beyond the parent size when changing
            // lineHeight. ¯\_(ツ)_/¯
            flexGrow: 1,
            height: 0,
            // @ts-ignore
            overflowY: 'overlay',
          }}
        ></div>
      </div>
    );
  }
);

export default OutputScreenPane;
