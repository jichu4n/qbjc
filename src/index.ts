#!/usr/bin/env node
import {program} from 'commander';
import fs from 'fs-extra';
import requireFromString from 'require-from-string';
import compile from './compile';
import {CompiledModule} from './runtime/compiled-code';
import {NodeExecutor} from './runtime/node-runtime';
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
      .option('--no-bundle', 'disable bundling with runtime code')
      .option(
        '--debug-ast',
        'enable generation of AST file for debugging compilation'
      )
      .option('--debug-trace', `enable stack trace for debugging compilation`)
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

    if (program.debugAst) {
      await fs.writeJson(`${sourceFilePath}.ast.json`, result.astModule, {
        spaces: 4,
      });
    }

    if (program.run) {
      const compiledModule = requireFromString(result.code)
        .default as CompiledModule;
      const executor = new NodeExecutor();
      await executor.executeModule(compiledModule);
    }
  })().catch((e) => {
    if ('message' in e) {
      if (program.debugTrace) {
        console.trace(e);
      } else {
        console.error(e.message);
      }
    }
  });
}
