import {RuntimePlatform} from './runtime';
import ansiEscapes from 'ansi-escapes';

/** RuntimePlatform implementing screen manipulation using ANSI escape codes.
 *
 * Ideally this functionality could be made into a mixin, but 1) it relies on this.print() etc and
 * so must be a class and 2) abstract classes don't support mixins yet:
 * https://github.com/microsoft/TypeScript/issues/35356
 */
abstract class AnsiTerminalRuntimPlatform extends RuntimePlatform {
  moveCursorTo(x: number, y: number) {
    this.print(ansiEscapes.cursorTo(0, 0));
  }

  clearScreen() {
    this.print(ansiEscapes.eraseScreen);
    this.moveCursorTo(0, 0);
  }
}

export default AnsiTerminalRuntimPlatform;
