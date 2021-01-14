import {autorun} from 'mobx';
import React, {useCallback, useEffect, useRef} from 'react';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import * as xtermWebfont from 'xterm-webfont';
import 'xterm/css/xterm.css';
import configManager, {ConfigKey} from './config-manager';
import PaneHeader from './pane-header';

function OutputScreenPane({
  onReady = () => {},
  style = {},
  dimensions = null,
}: {
  onReady?: (terminal: Terminal) => void;
  style?: React.CSSProperties;
  dimensions?: any;
} = {}) {
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddOnRef = useRef<FitAddon | null>(null);
  const init = useCallback(
    async (node: HTMLDivElement | null) => {
      if (!node || terminalRef.current) {
        return;
      }
      const terminal = new Terminal({
        // Output from compiled program will only specify \n for new lines, which need to be
        // translated to \r\n.
        convertEol: true,
      });
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.loadAddon(new xtermWebfont());
      // @ts-ignore method added by xterm-webfont addon
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
        fitAddon.fit();
      });
      window.addEventListener('resize', () => {
        fitAddon.fit();
      });
      terminalRef.current = terminal;
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
    console.log('FIT');
    fitAddOnRef.current.fit();
    prevDimensionsJson.current = dimensionsJson;
  }, [dimensionsJson]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', ...style}}>
      <PaneHeader title="Output"></PaneHeader>
      <div ref={init} style={{flex: 1}}></div>
    </div>
  );
}

export default OutputScreenPane;
