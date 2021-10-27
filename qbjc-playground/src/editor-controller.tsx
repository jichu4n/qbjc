/** Abstracted interface for controlling the code editor. */
abstract class EditorController {
  /** Returns the current editor content. */
  abstract getText(): string;
  /** Updates the editor content. */
  abstract setText(value: string): void;
  /** Make the editor grab focus. */
  abstract focus(): void;
  /** Moves the editor cursor to a location (zero-based). */
  abstract setCursor(line: number, col: number): void;
}

export default EditorController;
