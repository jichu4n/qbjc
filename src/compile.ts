import fs from 'fs-extra';
import path from 'path';
import codegen from './codegen/code-generator';
import {parseString} from './parser/parser';

export interface CompileResult {
  source: string;
  code: string;
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
  let parseResult: ReturnType<typeof parseString>;
  parseResult = parseString(source);
  if (parseResult.length === 0) {
    throw new Error(`Error: Unexpected end of input`);
  } else if (parseResult.length !== 1) {
    throw new Error(`Error: ${parseResult.length} parse trees`);
  }
  if (!parseResult[0]) {
    throw new Error(`Error: Invalid parse tree`);
  }

  // 3. TODO: Type checking

  // 4. Code generation.
  let {code, map: sourceMap} = codegen(parseResult[0], {
    sourceFileName: path.basename(sourceFilePath),
    enableBundling,
  });
  const outputFilePath = outputFilePathArg || `${sourceFilePath}.js`;
  if (enableSourceMap) {
    const sourceMapFileName = `${path.basename(outputFilePath)}.map`;
    await fs.writeFile(
      path.join(path.dirname(outputFilePath), sourceMapFileName),
      sourceMap
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
    outputFilePath,
  };

  return result;
}

export default compile;
