/** Location of an error in the source file. */
export interface Loc {
  line: number;
  col: number;
}

/** An error with source file and location info. */
export default class ErrorWithLoc extends Error {
  constructor(
    message: string,
    {
      sourceFileName,
      loc,
      cause,
    }: {
      sourceFileName?: string;
      loc?: {line: number; col: number};
      cause?: Error;
    } = {}
  ) {
    // @ts-ignore
    super(message, {cause});
    if (loc) {
      const sourceFileNamePrefix = sourceFileName ? `${sourceFileName}:` : '';
      const locPrefix = `${loc.line}:${loc.col}`;
      this.message = `${sourceFileNamePrefix}${locPrefix} - ${this.message}`;
      this.loc = loc;
    }
  }

  loc?: Loc;
}
