// Must polyfill process before importing ansi-escapes.
// @ts-ignore
window.process = window.process || require('process');

import ansiEscapes from 'ansi-escapes';
import {Terminal} from 'xterm';
import AnsiTerminalPlatform from './ansi-terminal-platform';
import {CompiledModule} from './compiled-code';
import Executor, {ExecutionOpts} from './executor';

/** RuntimePlatform for the browser environment based on xterm.js. */
export class BrowserPlatform extends AnsiTerminalPlatform {
  constructor(private readonly terminal: Terminal) {
    super();
  }

  // When running in the browser, delay is implemented as a busy loop as
  // setImmediate will block input processing. So disabling delay by default.
  defaultStmtExecutionDelayUs = 0;

  async loadCompiledModule(code: string) {
    // Drop "#!/usr/bin/env node" shebang line.
    const match = code.match(/^(?:#![^\n]+\n)?([\s\S]+)$/);
    if (!match) {
      throw new Error(`Empty code string`);
    }

    const fn = new Function('module', match[1]);
    const moduleObj = {exports: {}};
    fn(moduleObj);
    return moduleObj.exports as CompiledModule;
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
    const text: Array<string> = [];
    let cursorIdx = 0;
    let {x: initialX} = await this.getCursorPosition();
    const {cols} = await this.getScreenSize();
    const disposeFns: Array<() => void> = [];
    await new Promise<void>((resolve) => {
      const {dispose: removeOnDataListenerFn} = this.terminal.onData(
        async (chunk: string) => {
          switch (chunk) {
            case '\r':
              this.print('\n');
              resolve();
              break;
            case '\x7f': // backspace
              if (text.length > 0 && cursorIdx > 0) {
                text.splice(--cursorIdx, 1);
                this.print(ansiEscapes.cursorBackward());
                this.print(ansiEscapes.cursorSavePosition);
                this.print(ansiEscapes.eraseEndLine);
                this.print(text.slice(cursorIdx).join(''));
                this.print(ansiEscapes.cursorRestorePosition);
              }
              break;
            case '\x1b[3~': // delete
              if (cursorIdx < text.length) {
                text.splice(cursorIdx, 1);
                this.print(ansiEscapes.cursorSavePosition);
                this.print(ansiEscapes.eraseEndLine);
                this.print(text.slice(cursorIdx).join(''));
                this.print(ansiEscapes.cursorRestorePosition);
              }
              break;
            case '\x1b[C': // right
              if (cursorIdx < text.length) {
                ++cursorIdx;
                this.print(chunk);
              }
              break;
            case '\x1b[D': // left
              if (cursorIdx > 0) {
                --cursorIdx;
                this.print(chunk);
              }
              break;
            case '\x1b[F': // end
              if (cursorIdx < text.length) {
                this.print(ansiEscapes.cursorForward(text.length - cursorIdx));
                cursorIdx = text.length;
              }
              break;
            case '\x1b[H': // home
              if (cursorIdx > 0) {
                this.print(ansiEscapes.cursorBackward(cursorIdx));
                cursorIdx = 0;
              }
              break;
            default:
              // TODO: Support multi-line line editing.
              if (
                chunk.match(/^[\x20-\x7e]$/) &&
                initialX + text.length < cols - 2
              ) {
                // Printable ASCII
                text.splice(cursorIdx++, 0, chunk);
                this.print(chunk);
                this.print(ansiEscapes.cursorSavePosition);
                this.print(text.slice(cursorIdx).join(''));
                this.print(ansiEscapes.cursorRestorePosition);
              } else {
                console.log(
                  chunk
                    .split('')
                    .map((c) => c.charCodeAt(0))
                    .join(', ')
                );
              }
              break;
          }
        }
      );
      disposeFns.push(removeOnDataListenerFn);
      const checkShouldStopExecutionIntervalId = setInterval(() => {
        if (this.shouldStopExecution) {
          resolve();
        }
      }, 20);
      disposeFns.push(() => clearInterval(checkShouldStopExecutionIntervalId));
    });
    disposeFns.forEach((fn) => fn());
    return text.join('');
  }

  async getChar(): Promise<string | null> {
    let result: string | null = null;
    const {dispose} = this.terminal.onData((chunk: string) => {
      result = this.translateKeyCode(chunk.toString());
    });
    return new Promise<string | null>((resolve) => {
      setTimeout(() => {
        dispose();
        resolve(result);
      }, 20);
    });
  }

  async getCursorPosition(): Promise<{x: number; y: number}> {
    return new Promise<{x: number; y: number}>((resolve, reject) => {
      const {dispose} = this.terminal.onData((chunk: string) => {
        dispose();
        const match = chunk.toString().match(/\[(\d+)\;(\d+)R/);
        if (match) {
          const [row, col] = [match[1], match[2]];
          const result = {
            // ANSI row & col numbers are 1-based.
            x: parseInt(col) - 1,
            y: parseInt(row) - 1,
          };
          resolve(result);
        } else {
          reject();
        }
      });
      this.print(ansiEscapes.cursorGetPosition);
    });
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
