/** An error with source file and location info. */
export default class ErrorWithLoc extends Error {
  constructor(
    message: string,
    {
      sourceFileName,
      loc,
    }: {sourceFileName?: string; loc?: {line: number; col: number}} = {}
  ) {
    super(message);
    if (loc) {
      const sourceFileNamePrefix = sourceFileName ? `${sourceFileName}:` : '';
      const locPrefix = `${loc.line}:${loc.col}`;
      this.message = `${sourceFileNamePrefix}${locPrefix} - ${this.message}`;
    }
  }
}
