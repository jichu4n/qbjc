import fs from 'fs-extra';
import _ from 'lodash';
import path from 'path';
import stripAnsi from 'strip-ansi';
import compile from '../compile';
import Executor from '../runtime/executor';
import {NodePlatform} from '../runtime/node-platform';
const {AnsiTerminal} = require('node-ansiterminal');
const AnsiParser = require('node-ansiparser');

const TEST_SOURCE_DIR_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'tests',
  'testdata',
  'compile-and-run'
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
  async print(s: string) {
    this.stdout.push(s);
  }

  getStdout(enableAnsiTerminal: boolean) {
    if (enableAnsiTerminal) {
      const terminal = new AnsiTerminal(80, 25, 500);
      const parser = new AnsiParser(terminal);
      parser.parse(this.stdout.join(''));
      return terminal.toString();
    } else {
      return stripAnsi(this.stdout.join(''));
    }
  }

  async inputLine(): Promise<string> {
    if (this.stdin.length === 0) {
      throw new Error(`Input exhausted`);
    }
    return this.stdin.shift()!;
  }

  stdout: Array<string> = [];
  stdin: Array<string> = [];
}

interface ExpectSpec {
  io?: Array<{input: string} | {output: string}>;
  enableAnsiTerminal?: boolean;
}

async function testCompileAndRun(testFile: string) {
  const testFilePath = path.join(TEST_SOURCE_DIR_PATH, testFile);
  const source = await fs.readFile(testFilePath, 'utf-8');
  const {code} = await compile({
    source: await fs.readFile(testFilePath, 'utf-8'),
    sourceFileName: testFile,
  });
  await fs.writeFile(`${testFilePath}.js`, code);

  const expectSpec = parseExpectSpec(source);
  const nodePlatformForTest = new NodePlatformForTest();
  nodePlatformForTest.stdin = _.flatMap(expectSpec.io ?? [], (ioItem) =>
    'input' in ioItem ? [ioItem.input] : []
  );

  await new Executor(nodePlatformForTest, {
    stmtExecutionDelayUs: 0,
  }).executeModule(code);

  const expectedOutput = _.flatMap(expectSpec.io ?? [], (ioItem) =>
    'output' in ioItem ? [ioItem.output] : []
  );
  expect(
    nodePlatformForTest.getStdout(!!expectSpec.enableAnsiTerminal)
  ).toEqual(expectedOutput.join(''));
}

function parseExpectSpec(source: string): ExpectSpec {
  const expectCommentRegex = /^' EXPECT ({[\s\S]*})/m;
  const match = source.match(expectCommentRegex);
  if (!match) {
    return {};
  }
  const expectSpecJson = match[1].replace(/^'\s*/gm, '');
  let expectSpec = JSON.parse(expectSpecJson);
  return expectSpec;
}
