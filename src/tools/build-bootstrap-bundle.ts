// Script to bundle up bootstrap code as a single string.
import ncc from '@vercel/ncc';
import {program} from 'commander';
import fs from 'fs-extra';
import path from 'path';

if (require.main === module) {
  (async () => {
    program
      .option('--minify', 'Whether to minify the output bundle')
      .parse(process.argv);
    if (program.args.length !== 1) {
      console.error('Error: Please provide a single input file.');
      process.exit(1);
    }
    const sourceFilePath = path.resolve(program.args[0]);
    if (!sourceFilePath.endsWith('.js')) {
      console.error(
        `Error: Source file path ${sourceFilePath} does not have .js extension`
      );
      process.exit(1);
    }

    const {code} = await ncc(sourceFilePath, {
      minify: program.minify,
      quiet: true,
    });

    const outputCode = `module.exports = { default: ${JSON.stringify(code)} };`;
    const outputFilePath = path.join(
      path.dirname(sourceFilePath),
      `${path.basename(sourceFilePath, '.js')}-bundle.js`
    );
    await fs.writeFile(outputFilePath, outputCode);
  })();
}
