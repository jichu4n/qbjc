import {action, computed, makeObservable, observable, runInAction} from 'mobx';
import {compile, CompileResult, Loc} from 'qbjc';
import {BrowserExecutor} from 'qbjc/browser';
import {Terminal} from 'xterm';
import configManager, {
  ConfigKey,
  DEFAULT_SOURCE_FILE_NAME,
} from './config-manager';
import EditorController from './editor-controller';

export enum QbjcMessageType {
  /** General error message. */
  ERROR = 'error',
  /** General informational message with no special formatting. */
  INFO = 'info',
  /** Specialized message representing program execution. */
  EXECUTION = 'execution',
}
export interface QbjcMessage {
  /** Parsed location in the source code. */
  loc?: Loc;
  /** Message type. */
  type: QbjcMessageType;
  /** Message text. */
  message: string;
  /** For EXECUTION messages - the compiled code. */
  compileResult?: CompileResult;
}

class QbjcManager {
  /** Whether we're currently compiling / running code. */
  isRunning: boolean = false;

  /** Compiler errors and status messages. */
  messages: Array<QbjcMessage> = [];

  /** Editor controller instance. */
  editorController: EditorController | null = null;

  /** Current file name. */
  sourceFileName: string = configManager.getKey(
    ConfigKey.CURRENT_SOURCE_FILE_NAME
  );

  /** xterm.js terminal. */
  terminal: Terminal | null = null;

  /** Current executor. */
  private executor: BrowserExecutor | null = null;

  /** Connects this QbjcManager to the provided editor and terminal. */
  init({
    editorController,
    terminal,
  }: {
    editorController?: EditorController;
    terminal?: Terminal;
  }) {
    if (editorController) {
      this.editorController = editorController;
    }
    if (terminal) {
      this.terminal = terminal;
    }
  }

  /** Whether the required components (editor and terminal) are connected. */
  get isReady() {
    return !!this.editorController && !!this.terminal;
  }

  async run() {
    if (!this.editorController || !this.terminal || this.isRunning) {
      return;
    }
    const source = this.editorController.getText();
    if (!source.trim()) {
      return;
    }

    this.isRunning = true;
    let compileResult: CompileResult;
    try {
      compileResult = await compile({
        source,
        sourceFileName: this.sourceFileName,
      });
      console.log(compileResult.code);
    } catch (e: any) {
      console.error(`Compile error: ${e.message ?? JSON.stringify(e)}`);
      runInAction(() => {
        this.isRunning = false;
      });
      if (e.message) {
        this.pushMessage({
          loc: e.loc,
          type: QbjcMessageType.ERROR,
          message: e.message,
        });
      }
      return;
    }

    this.pushMessage({
      type: QbjcMessageType.EXECUTION,
      message: 'Running...',
      compileResult: compileResult,
    });
    const startTs = new Date();
    this.terminal.focus();
    this.executor = new BrowserExecutor(this.terminal, {
      stmtExecutionDelayUs: configManager.getKey(ConfigKey.EXECUTION_DELAY),
    });
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
      this.editorController.focus();
    }
  }

  stop() {
    if (!this.isRunning || !this.executor) {
      return;
    }
    this.executor.stopExecution();
  }

  goToMessageLocInEditor(loc: Loc) {
    if (!this.editorController || !loc) {
      return;
    }
    const {line, col} = loc;
    this.editorController.setCursor(line - 1, col - 1);
    this.editorController.focus();
  }

  pushMessage(message: QbjcMessage) {
    this.messages.push(message);
  }

  clearMessages() {
    this.messages.splice(0, this.messages.length);
  }

  updateSourceFileName(sourceFileName: string) {
    this.sourceFileName = sourceFileName.trim() || DEFAULT_SOURCE_FILE_NAME;
    configManager.setSourceFileName(
      configManager.currentSourceFile,
      this.sourceFileName
    );
    configManager.setKey(
      ConfigKey.CURRENT_SOURCE_FILE_NAME,
      this.sourceFileName
    );
  }

  constructor() {
    makeObservable(this, {
      isRunning: observable,
      messages: observable,
      editorController: observable.ref,
      sourceFileName: observable,
      terminal: observable.ref,
      isReady: computed,
      init: action,
      run: action,
      pushMessage: action,
      clearMessages: action,
      updateSourceFileName: action,
    });
  }
}

export default QbjcManager;
