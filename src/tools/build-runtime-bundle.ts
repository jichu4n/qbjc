/** @file Script to bundle up runtime code as a single string. */
import ncc from '@vercel/ncc';
import {program} from 'commander';
import fs from 'fs-extra';
import path from 'path';

if (require.main === module) {
  (async () => {
    program
      .arguments('<runtime.js> <output-runtime-bundle.js>')
      .option('--minify', 'Whether to minify the output bundle')
      .parse();
    const opts = program.opts();
    if (program.args.length !== 2) {
      console.error(program.usage());
      process.exit(1);
    }
    const [sourceFilePath, outputFilePath] = [
      path.resolve(program.args[0]), // ncc requires absolute paths
      program.args[1],
    ];
    for (const filePath of [sourceFilePath, outputFilePath]) {
      if (!filePath.endsWith('.js')) {
        console.error(
          `Error: File path ${filePath} does not have .js extension`
        );
        process.exit(1);
      }
    }

    const {code} = await ncc(sourceFilePath, {
      minify: opts.minify,
      quiet: true,
    });

    const outputCode = `module.exports = { default: ${JSON.stringify(code)} };`;
    await fs.writeFile(outputFilePath, outputCode);
  })();
}
