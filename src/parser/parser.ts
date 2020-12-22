import {Grammar, Parser, ParserOptions} from 'nearley';
import {Module} from '../ast/ast';
import grammar from './grammar';

export function createParser(opts?: ParserOptions) {
  return new Parser(Grammar.fromCompiled(grammar), opts);
}

/** Utility function for just parsing a string. */
export function parseString(
  input: string,
  opts?: ParserOptions
): Array<Module> {
  const parser = createParser(opts);
  parser.feed(input);
  // Add terminating line break (necessary due to lack of EOF terminal).
  parser.feed('\n');
  return parser.results;
}
