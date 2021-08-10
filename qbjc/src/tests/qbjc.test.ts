import childProcess from 'child_process';
import fs from 'fs-extra';
import path from 'path';

const TEST_SOURCE_DIR_PATH = path.join(
  __dirname,
  '..',
  '..',
  'src',
  'tests',
  'testdata',
  'qbjc'
);
const TEST_FILES = fs
  .readdirSync(TEST_SOURCE_DIR_PATH)
  .filter((fileName) => fileName.endsWith('.bas'));
const QBJC = path.join(__dirname, '..', 'qbjc.js');
const ARGS = [
  [],
  ['--no-bundle'],
  ['--minify'],
  ['--source-map'],
  ['--run'],
  ['--no-bundle', '--run'],
  ['--no-bundle', '--minify'],
  ['--no-bundle', '--minify', '--run'],
  ['--no-bundle', '--source-map'],
  ['--minify', '--source-map'],
  ['--no-bundle', '--minify', '--source-map'],
];

describe('Compile and run', () => {
  for (const testFile of TEST_FILES) {
    for (const args of ARGS) {
      test(`${testFile} ${args.join(' ')}`, () =>
        testQbjcCompileAndRun(testFile, args));
    }
  }
});

async function testQbjcCompileAndRun(testFile: string, args: Array<string>) {
  const testFilePath = path.resolve(path.join(TEST_SOURCE_DIR_PATH, testFile));
  const proc = childProcess.fork(QBJC, [...args, testFilePath]);
  await new Promise((resolve) => {
    proc.on('exit', resolve);
  });
  expect(proc!.exitCode).toStrictEqual(0);
}
