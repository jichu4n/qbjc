import {compile, CompileResult} from 'qbjc';
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
    this.terminal.writeln(compileResult.code);
  }
}

export default QbjcManager;
