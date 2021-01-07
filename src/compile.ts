import {minify} from 'terser';
import codegen from './codegen/codegen';
import {Module} from './lib/ast';
import parse from './parser/parser';
import {CompiledModule} from './runtime/compiled-code';
import runSemanticAnalysis from './semantic-analysis/semantic-analysis';

export interface CompileArgs {
  /** QBasic source code. */
  source: string;
  /** Source file name for populating debugging information in the compiled program. */
  sourceFileName?: string;
  /** Whether to bundle output with runtime code to produce a standalone program. */
  enableBundling?: boolean;
  /** Whether to minify the output. */
  enableMinify?: boolean;
}
export interface CompileResult {
  code: string;
  map: string;
  astModule: Module;
  compiledModule: CompiledModule;
}

const DEFAULT_SOURCE_FILE_NAME = 'source.bas';

/** Evaluates a compiled program and returns the CompiledModule.
 *
 * Warning: This will execute any module-level code with side effects in the string, so should NOT
 * be used for untrusted input. Compiled code from qbjc does not have any module-level code with
 * side effects.
 *
 * Inspired by https://github.com/amio/require-cjs-string/blob/master/index.js
 */
function requireCompiledModule(code: string): CompiledModule {
  // Drop "#!/usr/bin/env node" shebang line.
  const match = code.match(/^(?:#![^\n]+\n)?([\s\S]+)$/);
  if (!match) {
    throw new Error(`Empty code string`);
  }

  const fn = new Function('module', match[1]);
  const moduleObj = {exports: {}};
  fn(moduleObj);
  return moduleObj.exports as CompiledModule;
}

/** Compiles a QBasic program.
 *
 * This is the main entrypoint to qbjc's compiler.
 */
async function compile({
  source,
  sourceFileName = DEFAULT_SOURCE_FILE_NAME,
  enableBundling,
  enableMinify,
}: CompileArgs): Promise<CompileResult> {
  // 1. Parse input into AST.
  const astModule = parse(source, {sourceFileName});
  if (!astModule) {
    throw new Error(`Invalid parse tree`);
  }

  // 2. Semantic analysis.
  runSemanticAnalysis(astModule);

  // 3. Code generation.
  let {code, map: sourceMap} = codegen(astModule, {
    sourceFileName,
    enableBundling,
  });
  let sourceMapContent = sourceMap.toString();

  // 4. Minification.
  if (enableMinify) {
    const {code: minifiedCode, map: minifiedSourceMap} = await minify(code, {
      sourceMap: {
        filename: sourceFileName,
        content: sourceMapContent,
      },
    });
    if (minifiedCode && minifiedSourceMap) {
      code = minifiedCode;
      sourceMapContent = minifiedSourceMap as string;
    }
  }

  return {
    code,
    map: sourceMapContent,
    astModule,
    compiledModule: requireCompiledModule(code),
  };
}

export default compile;
