import {PrintArgType, PrintArg} from './compiled-code';

/** Interface for platform-specific runtime functionality. */
export interface RuntimePlatform {
  writeStdout(s: string): void;
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
          line += `${arg.value}`;
          break;
        default:
          throw new Error(`Unknown print arg type: '${JSON.stringify(arg)}'`);
      }
    }
    if (
      args.length === 0 ||
      args[args.length - 1].type === PrintArgType.VALUE
    ) {
      line += '\n';
    }
    this.platform.writeStdout(line);
  }
}
