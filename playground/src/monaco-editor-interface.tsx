import * as monaco from 'monaco-editor';
import EditorController from './editor-controller';

// Register qb syntax with Monaco.
import 'monaco-qb';

// Initialize Monaco editor worker.
// @ts-ignore
window.MonacoEnvironment = window.MonacoEnvironment || {
  getWorkerUrl() {
    // Since we'll only be using the editor to edit BASIC, we won't be using the
    // other workers (HTML / CSS / JS etc).
    return './monaco/vs/base/worker/workerMain.js';
  },
};

export class MonacoEditorController extends EditorController {
  constructor(private readonly editor: monaco.editor.ICodeEditor) {
    super();
  }

  getText() {
    return this.editor.getValue();
  }

  setText(value: string) {
    this.editor.setValue(value);
  }

  focus() {
    this.editor.focus();
  }

  setCursor(line: number, col: number) {
    const pos: monaco.IPosition = {lineNumber: line + 1, column: col + 1};
    this.editor.setPosition(pos);
    this.editor.revealPositionInCenterIfOutsideViewport(
      pos,
      monaco.editor.ScrollType.Smooth
    );
  }
}

export type MonacoThemeBundle = {
  [key: string]: {
    name: string;
    data: monaco.editor.IStandaloneThemeData;
  };
};

export const MONACO_THEMES: MonacoThemeBundle = require('./monaco-themes-bundle.json');

// Register themes with Monaco.
for (const [themeKey, themeNameAndData] of Object.entries(MONACO_THEMES)) {
  monaco.editor.defineTheme(themeKey, themeNameAndData.data);
}
