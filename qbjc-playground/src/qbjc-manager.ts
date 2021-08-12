import {Ace} from 'ace-builds';
import {action, computed, makeObservable, observable, runInAction} from 'mobx';
import {compile, CompileResult, Loc} from 'qbjc';
import {BrowserExecutor} from 'qbjc/browser';
import {Terminal} from 'xterm';

export enum QbjcMessageType {
  ERROR = 'error',
  INFO = 'info',
}

export enum QbjcMessageIconType {
  ERROR = 'error',
  PLAY_CIRCLE = 'playCircle',
}

export interface QbjcMessage {
  /** Parsed location in the source code. */
  loc?: Loc;
  /** Message type. */
  type: QbjcMessageType;
  /** Message text. */
  message: string;
  /** Message icon. */
  iconType?: QbjcMessageIconType;
}

class QbjcManager {
  /** Whether we're currently compiling / running code. */
  isRunning: boolean = false;

  /** Compiler errors and status messages. */
  messages: Array<QbjcMessage> = [];

  /** Connects this QbjcManager to the provided editor and terminal. */
  init({editor, terminal}: {editor?: Ace.Editor; terminal?: Terminal}) {
    if (editor) {
      this.editor = editor;
    }
    if (terminal) {
      this.terminal = terminal;
    }
  }

  /** Whether the required components (editor and terminal) are connected. */
  get isReady() {
    return !!this.editor && !!this.terminal;
  }

  async run() {
    if (!this.editor || !this.terminal || this.isRunning) {
      return;
    }
    const source = this.editor.getValue();
    if (!source.trim()) {
      return;
    }

    this.isRunning = true;

    let compileResult: CompileResult;
    try {
      compileResult = await compile({
        source,
        sourceFileName: 'program.bas',
      });
      console.log(compileResult.code);
    } catch (e) {
      console.error(`Compile error: ${e.message ?? JSON.stringify(e)}`);
      runInAction(() => {
        this.isRunning = false;
      });
      if (e.message) {
        this.pushMessage({
          loc: e.loc,
          type: QbjcMessageType.ERROR,
          message: e.message,
          iconType: QbjcMessageIconType.ERROR,
        });
      }
      return;
    }

    this.pushMessage({
      type: QbjcMessageType.INFO,
      message: 'Running...',
      iconType: QbjcMessageIconType.PLAY_CIRCLE,
    });
    const startTs = new Date();
    this.terminal.focus();
    this.executor = new BrowserExecutor(this.terminal);
    try {
      await this.executor.executeModule(compileResult.code);
    } finally {
      const endTs = new Date();
      runInAction(() => {
        this.isRunning = false;
      });
      this.pushMessage({
        type: QbjcMessageType.INFO,
        message:
          'Exited in ' +
          `${((endTs.getTime() - startTs.getTime()) / 1000).toFixed(3)}s`,
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

  goToMessageLocInEditor(loc: Loc) {
    if (!this.editor || !loc) {
      return;
    }
    const {line, col} = loc;
    this.editor.moveCursorTo(line - 1, col - 1);
    this.editor.selection.selectWordRight();
  }

  pushMessage(message: QbjcMessage) {
    this.messages.push(message);
  }

  clearMessages() {
    this.messages.splice(0, this.messages.length);
  }

  constructor() {
    makeObservable(this, {
      init: action,
      isReady: computed,
      isRunning: observable,
      messages: observable,
      run: action,
      pushMessage: action,
      clearMessages: action,
      editor: observable.ref,
      terminal: observable.ref,
    });
  }

  /** Ace editor. */
  editor: Ace.Editor | null = null;

  /** xterm.js terminal. */
  terminal: Terminal | null = null;

  /** Current executor. */
  private executor: BrowserExecutor | null = null;
}

export default QbjcManager;
