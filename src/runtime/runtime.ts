import moo, {Token} from 'moo';
import {DataTypeSpec, isNumeric, isString} from '../lib/types';
import {BUILTIN_FNS, BUILTIN_SUBS, lookupBuiltin, RunContext} from './builtins';
import {PrintArg, PrintArgType, Ptr, ValuePrintArg} from './compiled-code';
import ansiStyles from 'ansi-styles';
import roundHalfToEven from '../lib/round-half-to-even';

/** Interface for platform-specific runtime functionality. */
export abstract class RuntimePlatform {
  /** Delay for the specified number of microseconds. */
  abstract delay(delayInUs: number): Promise<void>;

  /** Print a string to stdout. */
  abstract print(s: string): Promise<void>;
  /** Reads a line of text from stdin. */
  abstract inputLine(): Promise<string>;
  /** Gets a single char from stdin, or return null if no pending input.
   *
   * (This is basically INKEY$.)
   */
  abstract getChar(): Promise<string | null>;

  // Text mode screen manipulation.

  /** Moves cursor to the specified location. */
  abstract moveCursorTo(x: number, y: number): Promise<void>;
  /** Gets current cursor position. */
  abstract getCursorPosition(): Promise<{x: number; y: number}>;
  /** Gets the terminal size. */
  abstract getScreenSize(): Promise<{rows: number; cols: number}>;
  /** Shows / hides cursor. */
  abstract setCursorVisibility(isCursorVisible: boolean): Promise<void>;
  /** Clears the screen. */
  abstract clearScreen(): Promise<void>;
  /** Sets the foreground color. */
  abstract setFgColor(colorName: ColorName): Promise<void>;
  /** Sets the background color. */
  abstract setBgColor(colorName: ColorName): Promise<void>;
}

export type ColorName = keyof ansiStyles.ForegroundColor;

/** SCREEN mode definition. */
export interface ScreenModeConfig {
  mode: number;
  textModeDimensions: Array<{rows: number; cols: number}>;
  colorMap: Array<ColorName>;
}

export const SCREEN_MODE_CONFIGS: Array<ScreenModeConfig> = [
  {
    mode: 0,
    textModeDimensions: [{rows: 80, cols: 25}],
    colorMap: [
      'black',
      'blue',
      'green',
      'cyan',
      'red',
      'magenta',
      'yellow', // Originally brown, which has no ANSI equivalent
      'white',
      'gray',
      'blueBright',
      'greenBright',
      'cyanBright',
      'redBright',
      'magentaBright',
      'yellowBright', // Originally yellow, but mapped to yellowBright to disambiguate from brown
      'whiteBright',
    ],
  },
];

/** Runtime support library.
 *
 * This class provides the interface invoked by compiled code. It is platform-agnostic, and wraps
 * the low-level, platform-dependent functionality in the injected RuntimePlatform.
 */
export default class Runtime {
  constructor(private readonly platform: RuntimePlatform) {}

  readonly roundHalfToEven = roundHalfToEven;

  async executeBuiltinProc(
    name: string,
    argTypeSpecs: Array<DataTypeSpec>,
    ...args: Array<Ptr>
  ) {
    const builtinProc =
      lookupBuiltin(BUILTIN_FNS, name, argTypeSpecs) ||
      lookupBuiltin(BUILTIN_SUBS, name, argTypeSpecs);
    if (!builtinProc) {
      throw new Error(`No matching built-in procedure found: "${name}"`);
    }
    if (argTypeSpecs.length !== args.length) {
      throw new Error(
        `Argument types and values do not match: ` +
          `expected ${argTypeSpecs.length} arguments, got ${args.length}`
      );
    }
    const runContext: RunContext = {
      runtime: this,
      platform: this.platform,
      argTypeSpecs,
      args,
    };
    return await builtinProc.run(
      ...args.map((ptr) => ptr[0][ptr[1]]),
      runContext
    );
  }

  async print(formatString: string | null, ...args: Array<PrintArg>) {
    let line = formatString
      ? this.printWithFormatString(formatString, args)
      : this.printWithDefaultFormat(args);
    if (
      args.length === 0 ||
      args[args.length - 1].type === PrintArgType.VALUE
    ) {
      line += '\n';
    }
    await this.platform.print(line);
  }

  /** Implements PRINT USING format strings.
   *
   * This is a VERY incomplete implementation. Supported:
   *
   *   - Formatting numbers with ##.##
   *   - Formatting string with &
   */
  private printWithFormatString(
    formatString: string,
    args: Array<PrintArg>
  ): string {
    const pieces: Array<string> = [];

    let argIdx = 0;
    this.printFormatStringLexer.reset(formatString);
    for (;;) {
      while (argIdx < args.length && args[argIdx].type !== PrintArgType.VALUE) {
        ++argIdx;
      }
      const nextArg =
        argIdx < args.length ? (args[argIdx] as ValuePrintArg) : null;
      const token = this.printFormatStringLexer.next();
      if (!token) {
        break;
      }
      switch (token.type) {
        case 'NUMBER':
          if (!nextArg || typeof nextArg.value !== 'number') {
            throw new Error(
              'Formatting error: expected number ' +
                `as argument #${argIdx + 1}, got ${typeof nextArg?.value}`
            );
          }
          let [integralFormat, fractionFormat] = token.value.split('.');
          // Not supporting commas yet.
          const integralFormatLength = integralFormat.replace(/,/, '').length;
          if (fractionFormat) {
            const formattedValue =
              `${Math.floor(nextArg.value)}`.padStart(integralFormatLength) +
              '.' +
              nextArg.value.toFixed(fractionFormat.length).split('.')[1];
            pieces.push(formattedValue);
          } else {
            const formattedValue =
              nextArg.value.toFixed(0).padStart(integralFormatLength) +
              (token.value.indexOf('.') >= 0 ? '.' : '');
            pieces.push(formattedValue);
          }
          ++argIdx;
          break;
        case 'STRING':
          if (!nextArg || typeof nextArg.value !== 'string') {
            throw new Error(
              `Formatting error: expected string as argument #${argIdx + 1}`
            );
          }
          pieces.push(nextArg.value);
          ++argIdx;
          break;
        case 'LITERAL':
          pieces.push(token.value);
          break;
        default:
          throw new Error(`Unexpected token type: ${JSON.stringify(token)}`);
      }
    }
    return pieces.join('');
  }

  private readonly printFormatStringLexer = moo.compile({
    NUMBER: /(?:[#,])*\.#+|[#,]+/,
    STRING: '&',
    LITERAL: {
      match: /[^.#&]+/,
      lineBreaks: true,
    },
  });

  private printWithDefaultFormat(args: Array<PrintArg>): string {
    const PRINT_ZONE_LENGTH = 14;
    let line = '';
    for (const arg of args) {
      switch (arg.type) {
        case PrintArgType.SEMICOLON:
          break;
        case PrintArgType.COMMA:
          const numPaddingChars =
            PRINT_ZONE_LENGTH - (line.length % PRINT_ZONE_LENGTH);
          line += ' '.repeat(numPaddingChars);
          break;
        case PrintArgType.VALUE:
          if (typeof arg.value === 'string') {
            line += `${arg.value}`;
            break;
          } else if (typeof arg.value === 'number') {
            line += `${arg.value >= 0 ? ' ' : ''}${arg.value} `;
            break;
          } else {
            // Fall through
          }
        default:
          throw new Error(`Unknown print arg: '${JSON.stringify(arg)}'`);
      }
    }
    return line;
  }

  async inputLine(prompt: string) {
    if (prompt) {
      await this.platform.print(prompt);
    }
    await this.platform.setCursorVisibility(true);
    const line = await this.platform.inputLine();
    await this.platform.setCursorVisibility(false);
    return line;
  }

  async input(prompt: string, ...resultTypes: Array<DataTypeSpec>) {
    for (;;) {
      await this.platform.print(prompt);

      const line = await this.inputLine('');
      const tokens = this.lexInput(line);
      let tokenIdx = 0;

      const results: Array<string | number> = [];
      let errorMessage: string | null = null;
      for (let resultIdx = 0; resultIdx < resultTypes.length; ++resultIdx) {
        const resultType = resultTypes[resultIdx];
        const errorMessagePrefix = `Error parsing value ${resultIdx + 1}: `;
        // Consume comma token for result 1+.
        if (resultIdx > 0) {
          if (tokenIdx < tokens.length && tokens[tokenIdx].type === 'COMMA') {
            ++tokenIdx;
          } else {
            errorMessage = `${errorMessagePrefix}Comma expected`;
            break;
          }
        }
        // Consume value.
        if (tokenIdx < tokens.length && tokens[tokenIdx].type === 'STRING') {
          const {value: tokenValue} = tokens[tokenIdx];
          if (isString(resultType)) {
            results.push(tokenValue);
          } else if (isNumeric(resultType)) {
            const numericValue = parseFloat(tokenValue);
            if (isNaN(numericValue)) {
              errorMessage = `${errorMessagePrefix}Invalid numeric value "${tokenValue}"`;
              break;
            } else {
              results.push(numericValue);
            }
          } else {
            throw new Error(`Unexpected result type ${resultType.type}`);
          }
          ++tokenIdx;
        } else {
          errorMessage = `${errorMessagePrefix}No value provided`;
          break;
        }
      }

      if (results.length === resultTypes.length) {
        return results;
      } else if (results.length < resultTypes.length) {
        await this.platform.print(
          `\n${errorMessage ? `${errorMessage}\n` : ''}Redo from start\n`
        );
      } else {
        throw new Error(
          `Too many results: expected ${resultTypes.length}, got ${results.length}`
        );
      }
    }
  }

  private lexInput(line: string) {
    this.inputLexer.reset(line.trim());
    const tokens: Array<Token> = [];
    for (;;) {
      const token = this.inputLexer.next();
      if (!token) {
        break;
      }
      if (token.type !== 'WHITESPACE') {
        tokens.push(token);
      }
    }
    return tokens;
  }

  /** Lexer for input(). */
  private readonly inputLexer = moo.compile({
    WHITESPACE: {match: /\s+/, lineBreaks: true},
    QUOTED_STRING: {
      match: /"[^"]*"/,
      value: (text) => text.substr(1, text.length - 2),
      type: () => 'STRING',
    },
    COMMA: ',',
    STRING: /[^,\s]+/,
  });

  setScreenMode(n: number) {
    const screenMode = SCREEN_MODE_CONFIGS.find(({mode}) => mode === n);
    if (!screenMode) {
      throw new Error(`Unsupported screen mode: ${n}`);
    }
    this.currentScreenMode = n;
  }

  get currentScreenModeConfig() {
    return SCREEN_MODE_CONFIGS.find(
      ({mode}) => mode === this.currentScreenMode
    )!;
  }

  private currentScreenMode: number = 0;
}
