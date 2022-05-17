import {Grammar, Parser, ParserOptions} from 'nearley';
import {Module} from '../lib/ast';
import grammar from './grammar';
import lexer from './lexer';
import ErrorWithLoc from '../lib/error-with-loc';

export function createParser(opts?: ParserOptions) {
  return new Parser(Grammar.fromCompiled(grammar), opts);
}

/** Entry point for parsing an input string into an AST module. */
export default function parse(
  input: string,
  opts?: {sourceFileName?: string} & ParserOptions
): Module {
  const parser = createParser(opts);
  try {
    parser.feed(input);
    // Add terminating line break (necessary due to lack of EOF terminal).
    parser.feed('\n');
  } catch (e: any) {
    if ('token' in e) {
      throw new ErrorWithLoc(
        // Hack to reduce verbosity of nearley error messages...
        e.message.replace(
          / Instead, I was expecting to see one of the following:$[\s\S]*/gm,
          ''
        ),
        {
          sourceFileName: opts?.sourceFileName,
          loc: e.token,
        }
      );
    } else {
      throw e;
    }
  }
  if (parser.results.length === 0) {
    throw new ErrorWithLoc(`Unexpected end of input`, {
      sourceFileName: opts?.sourceFileName,
      loc: lexer.lastToken,
    });
  } else if (parser.results.length !== 1) {
    throw new ErrorWithLoc(
      `${parser.results.length} parse trees:\n\n` +
        parser.results
          .map(
            (tree, idx) =>
              `Parse tree #${idx + 1}:\n${JSON.stringify(tree, null, 4)}`
          )
          .join('\n\n'),
      {
        sourceFileName: opts?.sourceFileName,
        loc: lexer.lastToken,
      }
    );
  }
  return parser.results[0];
}
