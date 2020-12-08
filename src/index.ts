import {parseString} from './parser/parser';
import codegen from './codegen/code-generator';

const input = `
  PRINT "HELLO"
  LET x = "world"
  PRINT x
  x = x + "!" + "!"
  PRINT x
`;

const parseResult = parseString(input);
console.log(JSON.stringify(parseResult, null, 2));

if (parseResult.length > 0 && parseResult[0] !== null) {
  const {code, map} = codegen(parseResult[0], {sourceFileName: 'test.bas'});
  console.log('-----------');
  console.log(code);
  console.log('-----------');
  console.log(map.toString());
}
