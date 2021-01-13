import {autorun} from 'mobx';
import React, {useCallback, useRef} from 'react';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import * as xtermWebfont from 'xterm-webfont';
import 'xterm/css/xterm.css';
import configManager, {ConfigKey} from './config-manager';

function Screen({
  onReady = () => {},
  style = {},
}: {onReady?: (terminal: Terminal) => void; style?: React.CSSProperties} = {}) {
  const terminalRef = useRef<Terminal | null>(null);
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
      onReady(terminal);
    },
    [onReady]
  );

  return <div ref={init} style={style}></div>;
}

export default Screen;
