import _ from 'lodash';
import {
  AssignStmt,
  AstVisitor,
  BinaryOp,
  BinaryOpExpr,
  CallStmt,
  CaseExprType,
  CondLoopStmt,
  ConstStmt,
  DimStmt,
  DimType,
  EndStmt,
  ExitForStmt,
  ExitLoopStmt,
  ExitProcStmt,
  Expr,
  ExprType,
  FnCallExpr,
  ForStmt,
  GosubStmt,
  GotoStmt,
  IfStmt,
  InputStmt,
  InputType,
  LabelStmt,
  LiteralExpr,
  Module,
  NextStmt,
  PrintStmt,
  Proc,
  ReturnStmt,
  SelectStmt,
  UnaryOp,
  UnaryOpExpr,
  UncondLoopStmt,
  VarRefExpr,
} from '../lib/ast';
import {lookupSymbol, VarScope, VarSymbol, VarType} from '../lib/symbol-table';
import {
  areMatchingElementaryTypes,
  DataTypeSpec,
  doubleSpec,
  integerSpec,
  isElementaryType,
  isNumeric,
  isString,
  longSpec,
  ProcType,
  procTypeName,
  singleSpec,
  stringSpec,
} from '../lib/types';

/** Map from variable type declaration suffix to the corresponding type spec. */
const TYPE_SUFFIX_MAP: {[key: string]: DataTypeSpec} = Object.freeze({
  '%': integerSpec(),
  '&': longSpec(),
  '!': singleSpec(),
  '#': doubleSpec(),
  $: stringSpec(),
});

/** Semantic analysis pass.
 *
 * Main tasks:
 *
 * - Type analysis for symbols, expressions and statements
 * - Build symbol table and resolve references
 */
export default class SemanticAnalyzer extends AstVisitor<void> {
  constructor(
    private readonly module: Module,
    {sourceFileName}: {sourceFileName?: string}
  ) {
    super();
    this.sourceFileName = sourceFileName;
  }

  run() {
    this.visitModule(this.module);
  }

  visitModule(module: Module): void {
    module.procs.forEach(this.preprocessProc.bind(this));

    this.currentProc = null;
    module.localSymbols = [];
    module.globalSymbols = [];
    this.acceptAll(module.stmts);

    this.acceptAll(module.procs);
  }

  private preprocessProc(node: Proc) {
    node.paramSymbols = node.params.map((param) => ({
      name: param.name,
      varType: VarType.ARG,
      typeSpec: param.typeSpec ?? this.getTypeSpecFromSuffix(param.name),
      varScope: VarScope.LOCAL,
    }));
    node.localSymbols = [];
    if (node.type === ProcType.FN) {
      if (!node.returnTypeSpec) {
        node.returnTypeSpec = this.getTypeSpecFromSuffix(node.name);
      }
      node.localSymbols.push({
        name: node.name,
        varType: VarType.VAR,
        typeSpec: node.returnTypeSpec,
        varScope: VarScope.LOCAL,
      });
    }
  }

  visitProc(node: Proc) {
    this.currentProc = node;
    this.acceptAll(node.stmts);
    this.currentProc = null;
  }

  visitLabelStmt(node: LabelStmt): void {}

  visitDimStmt(node: DimStmt): void {
    if (node.dimType === DimType.SHARED && this.currentProc) {
      this.throwError(
        'DIM SHARED statement can only be used at the module level, ' +
          `not inside a ${procTypeName(this.currentProc.type)}`,
        node
      );
    }
    if (node.dimType === DimType.STATIC && !this.currentProc) {
      this.throwError(
        'STATIC statement can only be used inside a procedure.',
        node
      );
    }
    for (const varDecl of node.varDecls) {
      const resolvedSymbol = this.lookupSymbol(varDecl.name);
      if (resolvedSymbol) {
        if (resolvedSymbol.varScope === VarScope.LOCAL) {
          this.throwError(
            `Variable already defined in local scope: "${varDecl.name}"`,
            node
          );
        } else if (
          resolvedSymbol.varScope === VarScope.GLOBAL &&
          node.dimType === DimType.SHARED
        ) {
          this.throwError(
            `Variable already defined in global scope: "${varDecl.name}"`,
            node
          );
        }
      }
      const typeSpec =
        varDecl.typeSpec ?? this.getTypeSpecFromSuffix(varDecl.name);
      switch (node.dimType) {
        case DimType.SHARED:
          this.module.globalSymbols!.push({
            name: varDecl.name,
            varType: VarType.VAR,
            typeSpec,
            varScope: VarScope.GLOBAL,
          });
          break;
        case DimType.LOCAL:
          this.addLocalSymbol(
            this.createLocalVarSymbol({
              name: varDecl.name,
              typeSpec,
            })
          );
          break;
        case DimType.STATIC:
          this.addLocalSymbol({
            name: varDecl.name,
            varType: VarType.STATIC_VAR,
            typeSpec,
            varScope: VarScope.LOCAL,
          });
          break;
        default:
          this.throwError(
            `Unknown DimType: ${JSON.stringify(node.dimType)}`,
            node
          );
      }
    }
  }

  visitAssignStmt(node: AssignStmt): void {
    this.accept(node.targetExpr);
    this.accept(node.valueExpr);
    const targetTypeSpec = node.targetExpr.typeSpec!;
    const valueTypeSpec = node.valueExpr.typeSpec!;
    if (!areMatchingElementaryTypes(targetTypeSpec, valueTypeSpec)) {
      this.throwError(
        `Cannot assign ${valueTypeSpec.type} value to ${targetTypeSpec.type} variable`,
        node
      );
    }
  }

  visitConstStmt(node: ConstStmt): void {
    for (const constDef of node.constDefs) {
      this.accept(constDef.valueExpr);
      const resolvedSymbol = this.lookupSymbol(constDef.name);
      if (resolvedSymbol) {
        if (resolvedSymbol.varScope === VarScope.LOCAL) {
          this.throwError(
            `Constant already defined in local scope: "${constDef.name}"`,
            node
          );
        } else if (
          resolvedSymbol.varScope === VarScope.GLOBAL &&
          !this.currentProc
        ) {
          this.throwError(
            `Constant already defined in global scope: "${constDef.name}"`,
            node
          );
        }
      }
      const symbol = {
        name: constDef.name,
        varType: VarType.CONST as const,
        typeSpec: constDef.valueExpr.typeSpec!,
      };
      if (this.currentProc) {
        this.addLocalSymbol({...symbol, varScope: VarScope.LOCAL});
        constDef.varScope = VarScope.LOCAL;
      } else {
        this.module.globalSymbols!.push({...symbol, varScope: VarScope.GLOBAL});
        constDef.varScope = VarScope.GLOBAL;
      }
    }
  }

  visitGotoStmt(node: GotoStmt): void {}

  private requireNumericExpr(...exprs: Array<Expr>) {
    for (const expr of exprs) {
      this.accept(expr);
      if (!isNumeric(expr.typeSpec!)) {
        this.throwError(
          `Expected numeric expression instead of ${expr.typeSpec!.type}`,
          expr
        );
      }
    }
  }

  private requireElementaryTypeExpr(...exprs: Array<Expr>) {
    for (const expr of exprs) {
      this.accept(expr);
      if (!isElementaryType(expr.typeSpec!)) {
        this.throwError(
          `Expected elementary type expression instead of ${
            expr.typeSpec!.type
          }`,
          expr
        );
      }
    }
  }

  visitIfStmt(node: IfStmt): void {
    for (const {condExpr, stmts} of node.ifBranches) {
      this.requireNumericExpr(condExpr);
      this.acceptAll(stmts);
    }
    if (node.elseBranch) {
      this.acceptAll(node.elseBranch.stmts);
    }
  }

  visitSelectStmt(node: SelectStmt): void {
    this.accept(node.testExpr);
    for (const {condExprs, stmts} of node.ifBranches) {
      for (const condExpr of condExprs) {
        const exprs: Array<Expr> = [];
        switch (condExpr.type) {
          case CaseExprType.VALUE:
            exprs.push(condExpr.valueExpr);
            break;
          case CaseExprType.RANGE:
            exprs.push(condExpr.lowerBoundExpr, condExpr.upperBoundExpr);
            break;
          case CaseExprType.COMP:
            exprs.push(condExpr.rightExpr);
            break;
          default:
            this.throwError(
              `Unknown case expression type: ${JSON.stringify(condExpr)}`,
              node
            );
        }
        this.acceptAll(exprs);
        for (const expr of exprs) {
          if (
            !areMatchingElementaryTypes(node.testExpr.typeSpec!, expr.typeSpec!)
          ) {
            this.throwError(
              'Case expression type does not match test expression: ' +
                `expected ${node.testExpr.typeSpec!.type}, got ${
                  expr.typeSpec!.type
                }`,
              expr
            );
          }
        }
      }
      this.acceptAll(stmts);
    }
    if (node.elseBranch) {
      this.acceptAll(node.elseBranch.stmts);
    }
  }

  visitCondLoopStmt(node: CondLoopStmt): void {
    this.requireNumericExpr(node.condExpr);
    this.acceptAll(node.stmts);
  }

  visitUncondLoopStmt(node: UncondLoopStmt): void {
    this.acceptAll(node.stmts);
  }

  visitExitLoopStmt(node: ExitLoopStmt): void {}

  visitForStmt(node: ForStmt): void {
    this.requireNumericExpr(
      node.counterExpr,
      node.startExpr,
      node.endExpr,
      ...(node.stepExpr ? [node.stepExpr] : [])
    );
  }

  visitNextStmt(node: NextStmt): void {
    this.requireNumericExpr(...node.counterExprs);
  }

  visitExitForStmt(node: ExitForStmt): void {}

  visitGosubStmt(node: GosubStmt): void {}

  visitReturnStmt(node: ReturnStmt): void {}

  visitCallStmt(node: CallStmt): void {
    const proc = lookupSymbol(this.module.procs, node.name);
    if (!proc || proc.type !== ProcType.SUB) {
      this.throwError(
        `${procTypeName(ProcType.SUB)} not found: "${node.name}"`,
        node
      );
    }
    this.visitProcCall(proc, node);
  }

  visitExitProcStmt(node: ExitProcStmt): void {
    if (!this.currentProc || this.currentProc.type !== node.procType) {
      this.throwError(
        `EXIT statement must be placed inside a ${procTypeName(node.procType)}`,
        node
      );
    }
  }

  visitEndStmt(node: EndStmt): void {}

  visitPrintStmt(node: PrintStmt): void {
    for (const arg of node.args) {
      if (typeof arg === 'string') {
        continue;
      }
      this.requireElementaryTypeExpr(arg);
    }
  }

  visitInputStmt(node: InputStmt): void {
    switch (node.inputType) {
      case InputType.TOKENIZED:
        this.requireElementaryTypeExpr(...node.targetExprs);
        break;
      case InputType.LINE:
        if (node.targetExprs.length !== 1) {
          this.throwError(
            `Expected single destination in LINE INPUT statement, got ${node.targetExprs.length}`,
            node
          );
        }
        this.accept(node.targetExprs[0]);
        if (!isString(node.targetExprs[0].typeSpec!)) {
          this.throwError(
            `Expected string destination in LINE INPUT statement, got ${
              node.targetExprs[0].typeSpec!.type
            }`,
            node.targetExprs[0]
          );
        }
        break;
      default:
        this.throwError(
          `Unknown input type: ${JSON.stringify(node.inputType)}`,
          node
        );
    }
  }

  visitLiteralExpr(node: LiteralExpr): void {
    if (typeof node.value === 'string') {
      node.typeSpec = stringSpec();
    } else if (typeof node.value === 'number') {
      // TODO
      node.typeSpec = singleSpec();
    } else {
      this.throwError(
        `Unknown literal expression value type: ${typeof node.value}`,
        node
      );
    }
  }

  visitVarRefExpr(node: VarRefExpr): void {
    let symbol = this.lookupSymbol(node.name);
    if (!symbol) {
      // VarRef may actually be a function invocation without args.
      let proc = lookupSymbol(this.module.procs, node.name);
      if (proc) {
        if (proc.type === ProcType.FN) {
          const fnCallExpr: FnCallExpr = {
            type: ExprType.FN_CALL,
            name: node.name,
            argExprs: [],
            loc: node.loc,
          };
          this.accept(fnCallExpr);
          Object.assign(node, fnCallExpr);
          return;
        } else {
          this.throwError(`Function not found: "${proc.name}"`, node);
        }
      }

      symbol = this.createLocalVarSymbol({
        name: node.name,
        typeSpec: this.getTypeSpecFromSuffix(node.name),
      });
      this.addLocalSymbol(symbol);
    }
    [node.typeSpec, node.varType, node.varScope] = [
      symbol.typeSpec,
      symbol.varType,
      symbol.varScope,
    ];
  }

  visitFnCallExpr(node: FnCallExpr): void {
    const proc = lookupSymbol(this.module.procs, node.name);
    if (!proc || proc.type !== ProcType.FN) {
      this.throwError(`Function not found: "${node.name}"`, node);
    }
    this.visitProcCall(proc, node);
    node.typeSpec = proc.returnTypeSpec!;
  }

  visitBinaryOpExpr(node: BinaryOpExpr): void {
    this.accept(node.leftExpr);
    this.accept(node.rightExpr);
    const leftTypeSpec = node.leftExpr.typeSpec!;
    const rightTypeSpec = node.rightExpr.typeSpec!;
    const errorMessage = `Incompatible types for ${node.op} operator: ${leftTypeSpec.type} and ${rightTypeSpec.type}`;
    const requireNumericOperands = () => {
      if (!isNumeric(leftTypeSpec, rightTypeSpec)) {
        this.throwError(errorMessage, node);
      }
    };
    const useCoercedNumericType = () => {
      node.typeSpec = this.coerceNumericTypes(leftTypeSpec, rightTypeSpec);
    };
    switch (node.op) {
      case BinaryOp.ADD:
        if (isString(leftTypeSpec, rightTypeSpec)) {
          node.typeSpec = stringSpec();
        } else {
          requireNumericOperands();
          useCoercedNumericType();
        }
        break;
      case BinaryOp.SUB:
      case BinaryOp.MUL:
      case BinaryOp.EXP:
      case BinaryOp.INTDIV:
      case BinaryOp.MOD:
        requireNumericOperands();
        useCoercedNumericType();
        break;
      case BinaryOp.DIV:
        requireNumericOperands();
        node.typeSpec = this.coerceNumericTypes(
          leftTypeSpec,
          rightTypeSpec,
          singleSpec()
        );
        break;
      case BinaryOp.AND:
      case BinaryOp.OR:
        requireNumericOperands();
        node.typeSpec = integerSpec();
        break;
      case BinaryOp.EQ:
      case BinaryOp.NE:
      case BinaryOp.GT:
      case BinaryOp.GTE:
      case BinaryOp.LT:
      case BinaryOp.LTE:
        if (!areMatchingElementaryTypes(leftTypeSpec, rightTypeSpec)) {
          this.throwError(errorMessage, node);
        }
        node.typeSpec = integerSpec();
        break;
      default:
        this.throwError(`Unknown operator ${node.op}`, node);
    }
  }

  visitUnaryOpExpr(node: UnaryOpExpr): void {
    this.accept(node.rightExpr);
    const rightTypeSpec = node.rightExpr.typeSpec!;
    switch (node.op) {
      case UnaryOp.NEG:
        this.requireNumericExpr(node.rightExpr);
        node.typeSpec = rightTypeSpec;
        break;
      case UnaryOp.NOT:
        this.requireNumericExpr(node.rightExpr);
        node.typeSpec = integerSpec();
        break;
      case UnaryOp.PARENS:
        node.typeSpec = rightTypeSpec;
        break;
      default:
        this.throwError(`Unknown operator ${node.op}`, node);
    }
  }

  private visitProcCall(proc: Proc, node: FnCallExpr | CallStmt) {
    if (proc.paramSymbols!.length !== node.argExprs.length) {
      this.throwError(
        `Incorrect number of arguments to "${node.name}": ` +
          `expected ${proc.paramSymbols!.length}, got ${node.argExprs.length}`,
        node
      );
    }
    this.acceptAll(node.argExprs);
    for (let i = 0; i < node.argExprs.length; ++i) {
      const paramTypeSpec = proc.paramSymbols![i].typeSpec;
      const argTypeSpec = node.argExprs[i].typeSpec!;
      if (!areMatchingElementaryTypes(paramTypeSpec, argTypeSpec)) {
        this.throwError(
          `Incompatible argument ${i + 1} to function "${node.name}": ` +
            `expected ${paramTypeSpec.type}, got ${argTypeSpec.type}`,
          node
        );
      }
    }
  }

  /** Computes the output numeric type after an arithmetic operation. */
  private coerceNumericTypes(...t: Array<DataTypeSpec>): DataTypeSpec {
    const RULES: Array<{
      operands: [DataTypeSpec, DataTypeSpec];
      result: DataTypeSpec;
    }> = [
      {operands: [integerSpec(), integerSpec()], result: integerSpec()},
      {operands: [integerSpec(), longSpec()], result: longSpec()},
      {operands: [integerSpec(), singleSpec()], result: singleSpec()},
      {operands: [integerSpec(), doubleSpec()], result: doubleSpec()},
      {operands: [longSpec(), integerSpec()], result: longSpec()},
      {operands: [longSpec(), longSpec()], result: longSpec()},
      {operands: [longSpec(), singleSpec()], result: singleSpec()},
      {operands: [longSpec(), doubleSpec()], result: doubleSpec()},
      {operands: [singleSpec(), integerSpec()], result: singleSpec()},
      {operands: [singleSpec(), longSpec()], result: singleSpec()},
      {operands: [singleSpec(), singleSpec()], result: singleSpec()},
      {operands: [singleSpec(), doubleSpec()], result: doubleSpec()},
      {operands: [doubleSpec(), integerSpec()], result: doubleSpec()},
      {operands: [doubleSpec(), longSpec()], result: doubleSpec()},
      {operands: [doubleSpec(), singleSpec()], result: doubleSpec()},
      {operands: [doubleSpec(), doubleSpec()], result: doubleSpec()},
    ];
    if (t.length === 0) {
      throw new Error('Missing arguments');
    }
    if (!isNumeric(...t)) {
      throw new Error(`Expected numeric types`);
    }
    let resultTypeSpec = t[0];
    for (let i = 1; i < t.length; ++i) {
      const matchingRule = RULES.find(
        ({operands: [typeSpec1, typeSpec2]}) =>
          _.isEqual(typeSpec1, resultTypeSpec) && _.isEqual(typeSpec2, t[i])
      );
      if (matchingRule) {
        resultTypeSpec = matchingRule.result;
      } else {
        throw new Error(
          `Unknown numeric type combination: ${resultTypeSpec.type} and ${t[i].type}`
        );
      }
    }
    return resultTypeSpec;
  }

  private getLocalSymbols() {
    return this.currentProc
      ? this.currentProc.localSymbols!
      : this.module.localSymbols!;
  }

  private lookupSymbol(name: string) {
    let symbol: VarSymbol | null = null;
    if (this.currentProc) {
      symbol = lookupSymbol(this.currentProc.paramSymbols!, name);
    }
    return (
      symbol ??
      lookupSymbol(this.getLocalSymbols(), name) ??
      lookupSymbol(this.module.globalSymbols!, name) ??
      null
    );
  }

  private createLocalVarSymbol(
    args: Omit<VarSymbol, 'varType' | 'varScope'>
  ): VarSymbol {
    return {
      ...args,
      varType:
        this.currentProc && this.currentProc.isDefaultStatic
          ? VarType.STATIC_VAR
          : VarType.VAR,
      varScope: VarScope.LOCAL,
    };
  }

  private addLocalSymbol(...args: Array<VarSymbol>) {
    return this.getLocalSymbols().push(...args);
  }

  private getTypeSpecFromSuffix(name: string) {
    const lastCharInName = name[name.length - 1];
    // TODO: Support DEFINT etc.
    return TYPE_SUFFIX_MAP[lastCharInName] ?? singleSpec();
  }

  /** The current proc being visited, or null if currently visiting module-level nodes. */
  private currentProc: Proc | null = null;
}