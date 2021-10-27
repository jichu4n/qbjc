import {Ace} from 'ace-builds';
import EditorController from './editor-controller';

/** EditorController implementation for Ace. */
class AceEditorController extends EditorController {
  constructor(private readonly editor: Ace.Editor) {
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
    this.editor.scrollToLine(line, true, true, () => {});
    this.editor.moveCursorTo(line, col);
    this.editor.selection.clearSelection();
  }
}

export default AceEditorController;
