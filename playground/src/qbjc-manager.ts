import {Ace} from 'ace-builds';
import {action, makeObservable, observable, runInAction} from 'mobx';
import {compile, CompileResult} from 'qbjc';
import {BrowserExecutor} from 'qbjc/browser';
import {Terminal} from 'xterm';

class QbjcManager {
  /** Whether we're currently compiling / running code. */
  isRunning: boolean = false;

  setEditor(editor: Ace.Editor) {
    this.editor = editor;
  }

  setTerminal(terminal: Terminal) {
    this.terminal = terminal;
  }

  async run() {
    if (!this.editor || !this.terminal || this.isRunning) {
      return;
    }
    this.isRunning = true;

    let compileResult: CompileResult;
    try {
      compileResult = await compile({
        source: this.editor.getValue(),
        sourceFileName: 'source',
      });
    } catch (e) {
      console.error(`Compile error: ${e.message ?? JSON.stringify(e)}`);
      if (e.message) {
        this.terminal.writeln(e.message);
      }
      runInAction(() => {
        this.isRunning = false;
      });
      return;
    }

    this.terminal.focus();
    this.executor = new BrowserExecutor(this.terminal);
    try {
      await this.executor.executeModule(compileResult.code);
    } finally {
      runInAction(() => {
        this.isRunning = false;
      });
      this.executor = null;
      this.editor.focus();
    }
  }

  stop() {
    if (!this.isRunning || !this.executor) {
      return;
    }
    this.executor.stopExecution();
  }

  constructor() {
    makeObservable(this, {
      isRunning: observable,
      setEditor: action,
      setTerminal: action,
      run: action,
    });
  }

  /** Ace editor. */
  private editor: Ace.Editor | null = null;

  /** xterm.js terminal. */
  private terminal: Terminal | null = null;

  /** Current executor. */
  private executor: BrowserExecutor | null = null;
}

export default QbjcManager;
