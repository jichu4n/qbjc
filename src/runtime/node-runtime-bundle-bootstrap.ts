import {CompiledModule} from './compiled-code';
import {ExecutionOpts} from './executor';
import {NodeExecutor} from './node-platform';

/** Bundled module compiled from BASIC source code. */
declare var compiledModule: CompiledModule | undefined;

/** Executes the bundled module.
 *
 * This is the main execution entrypoint to a compiled program.
 */
async function run(opts: ExecutionOpts = {}) {
  // Parse opts from environment variables.
  let stmtExecutionDelayUs: number | undefined;
  if (process.env.DELAY) {
    stmtExecutionDelayUs = parseInt(process.env.DELAY);
    if (isNaN(stmtExecutionDelayUs)) {
      stmtExecutionDelayUs = undefined;
    }
  }

  return await new NodeExecutor({
    stmtExecutionDelayUs,
    ...opts,
  }).executeModule(compiledModule!);
}

module.exports = {
  ...(typeof compiledModule === 'undefined' ? {} : compiledModule),
  run,
};

// When invoked directly as part of a compiled program, execute the bundled module.
if (require.main === module) {
  run();
}
