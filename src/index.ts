import nearley from 'nearley';
import grammar from './parser/grammar';

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed('\n:\n');
parser.feed(`
  PRINT "HELLO"
  LET x = "world"
  PRINT x
  x = x + "!" + "!"
  PRINT x
`);
parser.feed('\n');
console.log(JSON.stringify(parser.results, null, 2));
