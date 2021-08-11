import ansiEscapes from 'ansi-escapes';
import {performance} from 'perf_hooks';
import requireFromString from 'require-from-string';
import AnsiTerminalPlatform from './ansi-terminal-platform';
import {CompiledModule} from './compiled-code';
import Executor, {ExecutionOpts} from './executor';

/** RuntimePlatform for Node.JS on TTY. */
export class NodePlatform extends AnsiTerminalPlatform {
  async loadCompiledModule(code: string) {
    return requireFromString(code) as CompiledModule;
  }

  async delay(delayInUs: number) {
    const t0 = performance.now();
    while ((performance.now() - t0) * 1000 < delayInUs) {
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
  }

  async print(s: string) {
    process.stdout.write(s);
  }

  async inputLine(): Promise<string> {
    return new Promise<string>((resolve) => {
      process.stdin.resume();
      process.stdin.setRawMode(false);
      process.stdin.once('data', (chunk) => {
        process.stdin.pause();
        resolve(chunk.toString());
      });
    });
  }

  async getChar(): Promise<string | null> {
    // Based on https://stackoverflow.com/a/35688423/3401268
    let result: string | null = null;
    process.stdin.resume();
    process.stdin.setRawMode(true);
    const callbackFn = (chunk: Buffer) => {
      result = this.translateKeyCode(chunk.toString());
      // Handle Ctrl-C
      if (result === String.fromCharCode(3)) {
        throw new Error('Received Ctrl-C, aborting');
      }
      process.stdin.pause();
    };
    process.stdin.once('data', callbackFn);
    return new Promise<string | null>((resolve) => {
      setTimeout(() => {
        if (result === null) {
          process.stdin.removeListener('data', callbackFn);
          process.stdin.pause();
        }
        resolve(result);
      }, 20);
    });
  }

  async getCursorPosition(): Promise<{x: number; y: number}> {
    // Based on https://github.com/bubkoo/get-cursor-position/blob/master/index.js
    process.stdin.resume();
    const originalIsRaw = process.stdin.isRaw;
    process.stdin.setRawMode(true);
    return new Promise<{x: number; y: number}>((resolve, reject) => {
      process.stdin.once('data', (chunk) => {
        process.stdin.pause();
        process.stdin.setRawMode(originalIsRaw);
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
      process.stdout.write(ansiEscapes.cursorGetPosition);
    });
  }

  async getScreenSize(): Promise<{rows: number; cols: number}> {
    // Basd on https://stackoverflow.com/a/35688423/3401268
    const origPos = await this.getCursorPosition();
    await this.moveCursorTo(10000, 10000);
    const bottomRightPos = await this.getCursorPosition();
    await this.moveCursorTo(origPos.x, origPos.y);
    return {
      rows: bottomRightPos.y + 1,
      cols: bottomRightPos.x + 1,
    };
  }
}

export class NodeExecutor extends Executor {
  constructor(opts: ExecutionOpts = {}) {
    super(new NodePlatform(), opts);
  }
}
