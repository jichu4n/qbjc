import {RuntimePlatform, ColorName} from './runtime';
import ansiEscapes from 'ansi-escapes';
import ansiStyles from 'ansi-styles';

/** RuntimePlatform implementing screen manipulation using ANSI escape codes.
 *
 * Ideally this functionality could be made into a mixin, but 1) it relies on this.print() etc and
 * so must be a class and 2) abstract classes don't support mixins yet:
 * https://github.com/microsoft/TypeScript/issues/35356
 */
abstract class AnsiTerminalRuntimPlatform extends RuntimePlatform {
  async moveCursorTo(x: number, y: number) {
    this.print(ansiEscapes.cursorTo(x, y));
  }

  async setCursorVisibility(isCursorVisible: boolean) {
    this.print(
      isCursorVisible ? ansiEscapes.cursorShow : ansiEscapes.cursorHide
    );
  }

  async clearScreen() {
    this.print(ansiEscapes.eraseScreen);
    await this.moveCursorTo(0, 0);
  }

  async setFgColor(colorName: ColorName) {
    this.print(ansiStyles[colorName].open);
  }

  async setBgColor(colorName: ColorName) {
    const bgColorName = `bg${colorName[0].toUpperCase()}${colorName.substr(
      1
    )}` as keyof ansiStyles.BackgroundColor;
    this.print(ansiStyles[bgColorName].open);
  }
}

export default AnsiTerminalRuntimPlatform;
