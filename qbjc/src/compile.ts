import {minify} from 'terser';
import codegen from './codegen/codegen';
import {Module} from './lib/ast';
import parse from './parser/parser';
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

/** Result of a successful compilation. */
export interface CompileResult {
  /** Original QBasic source code. */
  source: string;
  /** Original source file name. */
  sourceFileName: string;
  /** Compiled JavaScript code. */
  code: string;
  /** Sourcemap for the compiled JavaScript code. */
  map: string;
  /** Abstract syntax tree representing the compiled code. */
  astModule: Module;
}

const DEFAULT_SOURCE_FILE_NAME = 'source.bas';

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
  runSemanticAnalysis(astModule, {sourceFileName});

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
    source,
    sourceFileName,
    code,
    map: sourceMapContent,
    astModule,
  };
}

export default compile;
