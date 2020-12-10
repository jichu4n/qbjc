import requireFromString from 'require-from-string';
import {parseString} from './parser/parser';
import codegen from './codegen/code-generator';
import {Executor} from './runtime/executor';

const input = `
  PRINT "HELLO"
  LET x = "world" + "!"
  PRINT x

  handleY:
  100 y = 2 + 3 * 4 ^ 5
  200 PRINT y + 1 <= 10 * 100
  300

  IF x > y THEN
    PRINT "x > y"
  ELSEIF x = y THEN
    PRINT "x = y"
  ELSEIF x < y THEN
    PRINT "x < y"
  ELSE
    PRINT "???"
  END IF

  IF x <> y THEN PRINT "x <> y" ELSE PRINT "x = y"
`;

const parseResult = parseString(input);
console.log(JSON.stringify(parseResult, null, 2));

if (parseResult.length > 0 && parseResult[0] !== null) {
  const {code, map} = codegen(parseResult[0], {sourceFileName: 'test.bas'});
  console.log('-----------');
  console.log(code);
  console.log('-----------');
  console.log(map.toString());
  console.log('-----------');

  const compiledModule = requireFromString(code).default;
  const executor = new Executor({});
  executor.executeModule(compiledModule);
}
