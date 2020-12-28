import {DataTypeSpec, isNumeric, isString} from '../lib/types';
import moo, {Token} from 'moo';
import {PrintArg, PrintArgType} from './compiled-code';

/** Interface for platform-specific runtime functionality. */
export interface RuntimePlatform {
  /** Print a string to stdout. */
  print(s: string): void;
  /** Reads a line of text from stdin. */
  inputLine(): Promise<string>;
}

/** Runtime support library.
 *
 * This class provides the interface invoked by compiled code. It is platform-agnostic, and wraps
 * the low-level, platform-dependent functionality in the injected RuntimePlatform.
 */
export default class Runtime {
  constructor(private readonly platform: RuntimePlatform) {}

  print(...args: Array<PrintArg>) {
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
    if (
      args.length === 0 ||
      args[args.length - 1].type === PrintArgType.VALUE
    ) {
      line += '\n';
    }
    this.platform.print(line);
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
