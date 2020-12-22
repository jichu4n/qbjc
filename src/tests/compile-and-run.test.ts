import fs from 'fs-extra';
import path from 'path';
import requireFromString from 'require-from-string';
import codegen from '../codegen/code-generator';
import {parseString} from '../parser/parser';
import {Executor} from '../runtime/executor';

const TEST_SOURCE_DIR_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'tests',
  'testdata'
);
const TEST_FILES = ['hello-world.bas'];

describe('Compile and run', () => {
  for (const testFile of TEST_FILES) {
    test(testFile, () => testCompileAndRun(testFile));
  }
});

async function testCompileAndRun(testFile: string) {
  const testFilePath = path.join(TEST_SOURCE_DIR_PATH, testFile);
  const source = await fs.readFile(testFilePath, 'utf-8');

  const parseResult = parseString(source);
  expect(parseResult).toHaveLength(1);
  expect(parseResult[0]).toBeTruthy();

  const {code} = codegen(parseResult[0]!, {sourceFileName: testFile});
  const compiledModule = requireFromString(code).default;
  const executor = new Executor({});
  executor.executeModule(compiledModule);
}
