import {Terminal} from 'xterm';
import AnsiTerminalPlatform from './ansi-terminal-platform';
import Executor, {ExecutionOpts} from './executor';

/** RuntimePlatform for the browser environment based on xterm.js. */
export class BrowserPlatform extends AnsiTerminalPlatform {
  constructor(private readonly terminal: Terminal) {
    super();
  }

  async delay(delayInUs: number) {
    if (
      typeof window === 'undefined' ||
      typeof window.performance === 'undefined'
    ) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, Math.round(delayInUs / 1000))
      );
    } else {
      const t0 = performance.now();
      while ((performance.now() - t0) * 1000 < delayInUs) {}
    }
  }

  async print(s: string) {
    this.terminal.write(s);
  }

  async inputLine(): Promise<string> {
    return 'foo';
  }

  async getChar(): Promise<string | null> {
    return null;
  }

  async getCursorPosition(): Promise<{x: number; y: number}> {
    return {
      x: this.terminal.buffer.active.cursorX,
      y: this.terminal.buffer.active.cursorY,
    };
  }

  async getScreenSize(): Promise<{rows: number; cols: number}> {
    return {
      rows: this.terminal.rows,
      cols: this.terminal.cols,
    };
  }
}

export class BrowserExecutor extends Executor {
  constructor(terminal: Terminal, opts: ExecutionOpts = {}) {
    super(new BrowserPlatform(terminal), opts);
  }
}
