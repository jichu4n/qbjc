import Platform from './platform';

/** Runtime support library. */
export default class Runtime {
  constructor(private readonly platform: Platform) {}

  print(...args: any) {
    for (const arg of args) {
      this.platform.writeStdout(`${arg}\n`); // TODO
    }
  }
}
