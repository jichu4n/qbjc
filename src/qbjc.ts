#!/usr/bin/env node

import {program} from 'commander';
import fs from 'fs-extra';
import path from 'path';
import compile, {CompileArgs, CompileResult} from './compile';
import {NodeExecutor} from './runtime/node-platform';
// Not using resolveJsonModule because it causes the output to be generated relative to the root
// directory instead of src/.
const packageJson = require('../package.json');

export interface CompileFileArgs
  extends Omit<CompileArgs, 'source' | 'sourceFileName'> {
  sourceFilePath: string;
  outputFilePath?: string;
  enableSourceMap?: boolean;
}

export interface CompileFileResult extends CompileResult {
  source: string;
  outputFilePath: string;
}

/** Compiles a QBasic source file and write out the compiled program and source map. */
export async function compileFile({
  sourceFilePath,
  outputFilePath: outputFilePathArg,
  enableSourceMap,
  enableBundling,
  enableMinify,
}: CompileFileArgs): Promise<CompileFileResult> {
  // 1. Read source file.
  const source = await fs.readFile(sourceFilePath, 'utf-8');

  // 2. Compile code.
  const sourceFileName = path.basename(sourceFilePath);
  const compileResult = await compile({
    source,
    sourceFileName,
    enableBundling,
    enableMinify,
  });
  let {code, map: sourceMapContent} = compileResult;

  // 3. Write compiled program and source map.
  const outputFilePath = outputFilePathArg || `${sourceFilePath}.js`;
  if (enableSourceMap) {
    const sourceMapFileName = `${path.basename(outputFilePath)}.map`;
    await fs.writeFile(
      path.join(path.dirname(outputFilePath), sourceMapFileName),
      sourceMapContent
    );

    code += `\n//# sourceMappingURL=${sourceMapFileName}\n`;
  }
  await fs.writeFile(outputFilePath, code);
  if (enableBundling) {
    await fs.chmod(outputFilePath, '755');
  }

  return {
    ...compileResult,
    source,
    code,
    map: sourceMapContent,
    outputFilePath,
  };
}

// Entrypoint for the "qbjc" CLI tool.
if (require.main === module) {
  (async () => {
    program
      .name(packageJson.name)
      .version(packageJson.version)
      .arguments('<file.bas>')
      .option('-o, --output <file>', 'output file path')
      .option('-r, --run', 'run the compiled program after compilation')
      .option('--minify', 'minify the compiled program')
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

    const compileFileResult = await compileFile({
      sourceFilePath,
      outputFilePath: program.output,
      enableSourceMap: program.sourceMap,
      enableBundling: program.bundle,
      enableMinify: program.minify,
    });

    if (program.debugAst) {
      await fs.writeJson(
        `${sourceFilePath}.ast.json`,
        compileFileResult.astModule,
        {
          spaces: 4,
        }
      );
    }

    if (program.run) {
      const executor = new NodeExecutor();
      await executor.executeModule(compileFileResult.compiledModule);
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
