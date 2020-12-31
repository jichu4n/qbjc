import moo, {Token} from 'moo';
import {DataTypeSpec, isNumeric, isString} from '../lib/types';
import {BUILTIN_FNS, BUILTIN_SUBS, lookupBuiltin, RunContext} from './builtins';
import {PrintArg, PrintArgType, Ptr, ValuePrintArg} from './compiled-code';

/** Interface for platform-specific runtime functionality. */
export abstract class RuntimePlatform {
  /** Print a string to stdout. */
  abstract print(s: string): void;
  /** Reads a line of text from stdin. */
  abstract inputLine(): Promise<string>;

  // Text mode screen manipulation.

  /** Move cursor to the specified location. */
  abstract moveCursorTo(x: number, y: number): void;
  /** Get current cursor position. */
  // getCursorPosition(): Promise<{x: number; y: number}>;
  /** Get current cursor position. */
  // setCursorVisibility(isCursorVisible: boolean): void;
  /** Clear the screen. */
  abstract clearScreen(): void;
}

/** Runtime support library.
 *
 * This class provides the interface invoked by compiled code. It is platform-agnostic, and wraps
 * the low-level, platform-dependent functionality in the injected RuntimePlatform.
 */
export default class Runtime {
  constructor(private readonly platform: RuntimePlatform) {}

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

  print(formatString: string | null, ...args: Array<PrintArg>) {
    let line = formatString
      ? this.printWithFormatString(formatString, args)
      : this.printWithDefaultFormat(args);
    if (
      args.length === 0 ||
      args[args.length - 1].type === PrintArgType.VALUE
    ) {
      line += '\n';
    }
    this.platform.print(line);
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
          if (fractionFormat) {
            const formattedValue =
              `${Math.floor(nextArg.value)}`.padStart(integralFormat.length) +
              '.' +
              nextArg.value.toFixed(fractionFormat.length).split('.')[1];
            pieces.push(formattedValue);
          } else {
            const formattedValue =
              nextArg.value.toFixed(0).padStart(integralFormat.length) +
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
    NUMBER: /#*\.#+|#+/,
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
    this.platform.print(prompt);
    return await this.platform.inputLine();
  }

  async input(prompt: string, ...resultTypes: Array<DataTypeSpec>) {
    for (;;) {
      this.platform.print(prompt);

      const line = await this.platform.inputLine();
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
        this.platform.print(
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
}
