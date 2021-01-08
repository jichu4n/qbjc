import {compile, CompileResult} from 'qbjc';
import {BrowserExecutor} from 'qbjc/browser';
import {Terminal} from 'xterm';

class QbjcManager {
  constructor(private readonly terminal: Terminal) {}

  async compileAndRun(source: string) {
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
    const executor = new BrowserExecutor(this.terminal);
    await executor.executeModule(compileResult.compiledModule);
  }
}

export default QbjcManager;
