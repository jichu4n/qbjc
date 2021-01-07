import React, {useCallback, useRef} from 'react';
import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

function Screen({style = {}}: {style?: React.CSSProperties} = {}) {
  const terminalRef = useRef<Terminal | null>(null);
  const init = useCallback((node: HTMLDivElement | null) => {
    if (!node || terminalRef.current) {
      return;
    }
    const terminal = new Terminal();
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(node);
    fitAddon.fit();
    terminalRef.current = terminal;
  }, []);

  return <div ref={init} style={style}></div>;
}

export default Screen;
