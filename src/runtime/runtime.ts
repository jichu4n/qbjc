import Platform from './platform';
import {PrintArgType, PrintArg} from './compiled-code';

/** Runtime support library for compiled code. */
export default class Runtime {
  constructor(private readonly platform: Platform) {}

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
