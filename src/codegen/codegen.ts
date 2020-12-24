import {Module} from '../ast/ast';
import CodeGenerator, {CodeGeneratorOpts} from './code-generator';
import SemanticAnalyzer from './semantic-analyzer';

/** Entry point for code generation from an AST module. */
export default function codegen(module: Module, opts: CodeGeneratorOpts = {}) {
  new SemanticAnalyzer(module, opts).run();
  return new CodeGenerator(module, opts).run();
}
