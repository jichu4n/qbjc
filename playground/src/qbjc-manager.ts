import {compile, CompileResult} from 'qbjc';
import {BrowserExecutor} from 'qbjc/browser';
import {Terminal} from 'xterm';

class QbjcManager {
  constructor(private readonly terminal: Terminal) {}

  async compileAndRun(source: string) {
    if (this.executor) {
      return;
    }

    let compileResult: CompileResult;
    try {
      compileResult = await compile({
        source,
        sourceFileName: 'source',
      });
    } catch (e) {
      console.error(`Compile error: ${e.message ?? JSON.stringify(e)}`);
      if (e.message) {
        this.terminal.writeln(e.message);
      }
      return;
    }
    this.executor = new BrowserExecutor(this.terminal);
    try {
      await this.executor.executeModule(compileResult.code);
    } finally {
      this.executor = null;
    }
  }

  stop() {
    if (!this.executor) {
      return;
    }
    this.executor.stopExecution();
  }

  /** Current executor. */
  private executor: BrowserExecutor | null = null;
}

export default QbjcManager;
