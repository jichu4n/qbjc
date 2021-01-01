import fs from 'fs-extra';
import path from 'path';
import codegen from './codegen/codegen';
import {Module} from './lib/ast';
import parse from './parser/parser';
import runSemanticAnalysis from './semantic-analysis/semantic-analysis';

export interface CompileResult {
  source: string;
  code: string;
  astModule: Module;
  outputFilePath: string;
}

async function compile({
  sourceFilePath,
  outputFilePath: outputFilePathArg,
  enableSourceMap,
  enableBundling,
}: {
  sourceFilePath: string;
  outputFilePath?: string;
  enableSourceMap?: boolean;
  enableBundling?: boolean;
}): Promise<CompileResult> {
  // 1. Read source file.
  const source = await fs.readFile(sourceFilePath, 'utf-8');

  // 2. Parse source file to AST.
  const sourceFileName = path.basename(sourceFilePath);
  const astModule = parse(source, {sourceFileName});
  if (!astModule) {
    throw new Error(`Invalid parse tree`);
  }

  // 3. Semantic analysis.
  runSemanticAnalysis(astModule);

  // 4. Code generation.
  let {code, map: sourceMap} = codegen(astModule, {
    sourceFileName,
    enableBundling,
  });
  const outputFilePath = outputFilePathArg || `${sourceFilePath}.js`;
  if (enableSourceMap) {
    const sourceMapFileName = `${path.basename(outputFilePath)}.map`;
    await fs.writeFile(
      path.join(path.dirname(outputFilePath), sourceMapFileName),
      sourceMap.toString()
    );

    code += `\n//# sourceMappingURL=${sourceMapFileName}\n`;
  }
  await fs.writeFile(outputFilePath, code);
  if (enableBundling) {
    await fs.chmod(outputFilePath, '755');
  }

  const result: CompileResult = {
    source,
    code,
    astModule,
    outputFilePath,
  };

  return result;
}

export default compile;
