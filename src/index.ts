#!/usr/bin/env node
import {program} from 'commander';
import requireFromString from 'require-from-string';
import compile from './compile';
import Executor from './runtime/executor';
import NodePlatform from './runtime/node-platform';
// Not using resolveJsonModule because it causes the output to be generated relative to the root
// directory instead of src/.
const packageJson = require('../package.json');

if (require.main === module) {
  (async () => {
    program
      .name(packageJson.name)
      .version(packageJson.version)
      .arguments('<file.bas>')
      .option('-o, --output <file>', 'output file path')
      .option('-r, --run', 'run the compiled program after compilation')
      .option('--source-map', 'enable source map generation')
      .option('--bundle', 'enable generation of standalone single file bundle')
      .parse(process.argv);

    if (program.args.length === 0) {
      console.error('Error: No input files specified.');
      process.exit(1);
    } else if (program.args.length > 1) {
      console.error('Error: Please provide a single input file.');
      process.exit(1);
    }
    const sourceFilePath = program.args[0];

    const result = await compile({
      sourceFilePath,
      outputFilePath: program.output || undefined,
      enableSourceMap: program.sourceMap,
      enableBundling: program.bundle,
    });

    if (program.run) {
      if (program.bundle) {
        const run = requireFromString(result.code).default;
        await run();
      } else {
        const compiledModule = requireFromString(result.code).default;
        const executor = new Executor(new NodePlatform());
        await executor.executeModule(compiledModule);
      }
    }
  })();
}
