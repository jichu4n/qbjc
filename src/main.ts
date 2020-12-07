import nearley from 'nearley';
import grammar from './parser/grammar';

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
parser.feed('END');
console.log(JSON.stringify(parser.results));
