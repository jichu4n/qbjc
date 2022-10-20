import {editor, IPosition} from 'monaco-editor';
import EditorController from './editor-controller';

// Initialize Monaco editor worker.
// @ts-ignore
window.MonacoEnvironment = window.MonacoEnvironment || {
  getWorkerUrl() {
    // Since we'll only be using the editor to edit BASIC, we won't be using the
    // other workers (HTML / CSS / JS etc).
    return './monaco/workerMain.js';
  },
};

class MonacoEditorController extends EditorController {
  constructor(private readonly editor: editor.ICodeEditor) {
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
    const pos: IPosition = {lineNumber: line + 1, column: col + 1};
    this.editor.setPosition(pos);
    this.editor.revealPositionInCenterIfOutsideViewport(
      pos,
      editor.ScrollType.Smooth
    );
  }
}

export default MonacoEditorController;
