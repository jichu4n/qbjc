import fs from 'fs-extra';
import path from 'path';
import requireFromString from 'require-from-string';
import codegen from '../codegen/code-generator';
import {parseString} from '../parser/parser';
import {Executor} from '../runtime/executor';
import NodePlatform from '../runtime/node-platform';
import _ from 'lodash';

const TEST_SOURCE_DIR_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'tests',
  'testdata'
);
const TEST_FILES = fs
  .readdirSync(TEST_SOURCE_DIR_PATH)
  .filter((fileName) => fileName.endsWith('.bas'));

describe('Compile and run', () => {
  for (const testFile of TEST_FILES) {
    test(testFile, () => testCompileAndRun(testFile));
  }
});

class NodePlatformForTest extends NodePlatform {
  writeStdout(s: string) {
    this.stdout.push(s);
  }

  stdout: Array<string> = [];
}

interface ExpectSpec {
  io?: Array<{input: string} | {output: string}>;
}

async function testCompileAndRun(testFile: string) {
  const testFilePath = path.join(TEST_SOURCE_DIR_PATH, testFile);
  const source = await fs.readFile(testFilePath, 'utf-8');

  const parseResult = parseString(source);
  const astFilePath = `${testFilePath}.ast.json`;
  await fs.writeJSON(astFilePath, parseResult, {spaces: 4});
  expect(parseResult).toHaveLength(1);
  expect(parseResult[0]).toBeTruthy();

  const {code} = codegen(parseResult[0]!, {sourceFileName: testFile});
  const compiledCodeFilePath = `${testFilePath}.js`;
  await fs.writeFile(compiledCodeFilePath, code);

  const compiledModule = requireFromString(code).default;
  const nodePlatformForTest = new NodePlatformForTest();
  const executor = new Executor(nodePlatformForTest);
  await executor.executeModule(compiledModule);

  const expectSpec = parseExpectSpec(source);
  const expectedOutput = _.flatMap(expectSpec.io ?? [], (ioItem) =>
    'output' in ioItem ? [ioItem.output] : []
  );
  expect(nodePlatformForTest.stdout).toEqual(expectedOutput);
}

function parseExpectSpec(source: string): ExpectSpec {
  const expectCommentRegex = /^' EXPECT ({[\s\S]*})/m;
  const match = source.match(expectCommentRegex);
  if (!match) {
    return {};
  }
  const expectSpecJson = match[1].replace(/^'\s*/gm, '');
  const expectSpec = JSON.parse(expectSpecJson) as ExpectSpec;
  return expectSpec;
}
