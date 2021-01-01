import _ from 'lodash';
import {
  AssignStmt,
  AstNodeBase,
  AstNodeLocation,
  AstVisitor,
  BinaryOp,
  BinaryOpExpr,
  CallStmt,
  CaseExprType,
  CondLoopStmt,
  ConstStmt,
  DataStmt,
  DataTypeExpr,
  DataTypeExprType,
  DefTypeStmt,
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
  isLhsExpr,
  isSingularTypeExpr,
  LabelStmt,
  LiteralExpr,
  MemberExpr,
  Module,
  NextStmt,
  PrintStmt,
  Proc,
  ReadStmt,
  RestoreStmt,
  ReturnStmt,
  SelectStmt,
  Stmts,
  StmtType,
  SubscriptExpr,
  SwapStmt,
  Udt,
  UnaryOp,
  UnaryOpExpr,
  UncondLoopStmt,
  VarRefExpr,
} from '../lib/ast';
import {lookupSymbol, VarScope, VarSymbol, VarType} from '../lib/symbol-table';
import {
  areMatchingElementaryTypes,
  areMatchingSingularTypes,
  ArrayDimensionSpec,
  arraySpec,
  DataType,
  DataTypeSpec,
  doubleSpec,
  ElementaryTypeSpec,
  integerSpec,
  isArray,
  isElementaryType,
  isNumeric,
  isString,
  isUdt,
  longSpec,
  ProcDefType,
  ProcType,
  procTypeName,
  singleSpec,
  SingularTypeSpec,
  stringSpec,
  typeSpecName,
  UdtTypeSpec,
} from '../lib/types';
import {
  BuiltinFn,
  BuiltinSub,
  BUILTIN_FNS,
  BUILTIN_SUBS,
  lookupBuiltin,
} from '../runtime/builtins';

/** Map from variable type declaration suffix to the corresponding type spec. */
const TYPE_SUFFIX_MAP: {[key: string]: ElementaryTypeSpec} = Object.freeze({
  '%': integerSpec(),
  '&': longSpec(),
  '!': singleSpec(),
  '#': doubleSpec(),
  $: stringSpec(),
});

/** Default array dimension spec. */
const DEFAULT_DIMENSION_SPEC: ArrayDimensionSpec = [0, 10];

type ResolvedFn =
  | {
      defType: ProcDefType.BUILTIN;
      builtinProc: BuiltinFn;
      returnTypeSpec: DataTypeSpec;
    }
  | {
      defType: ProcDefType.MODULE;
      proc: Proc;
      returnTypeSpec: DataTypeSpec | null;
    };

type ResolvedSub =
  | {
      defType: ProcDefType.BUILTIN;
      builtinProc: BuiltinSub;
    }
  | {
      defType: ProcDefType.MODULE;
      proc: Proc;
    };

export interface SemanticAnalyzerOpts {
  sourceFileName?: string;
}

/** Semantic analysis pass.
 *
 * Main tasks:
 *
 * - Type analysis for symbols, expressions and statements
 * - Build symbol table and resolve references
 */
export class SemanticAnalyzer extends AstVisitor<void> {
  constructor(
    private readonly module: Module,
    {sourceFileName}: SemanticAnalyzerOpts = {}
  ) {
    super();
    this.sourceFileName = sourceFileName;
  }

  run() {
    this.visitModule(this.module);
  }

  visitModule(module: Module): void {
    this.setUpDefTypeMap();

    // Resolve UDT types.
    this.udtStack = [];
    module.udts.forEach(this.visitUdt.bind(this));

    // Resolve type signatures of procs.
    module.procs.forEach(this.preprocessProc.bind(this));

    this.currentProc = null;
    module.localSymbols = [];
    module.globalSymbols = [];
    module.labels = this.getLabels(module.stmts);
    this.acceptAll(module.stmts);

    this.acceptAll(module.procs);
  }

  private preprocessProc(node: Proc) {
    node.paramSymbols = node.params.map((param) => ({
      name: param.name,
      varType: VarType.ARG,
      typeSpec: this.getTypeSpecForVarDeclOrParam(param),
      varScope: VarScope.LOCAL,
    }));
    node.localSymbols = [];
    if (node.type === ProcType.FN) {
      if (!node.returnTypeSpec) {
        node.returnTypeSpec = this.getDefaultTypeSpecFromName(node.name);
      }
      node.localSymbols.push({
        name: node.name,
        varType: VarType.VAR,
        typeSpec: node.returnTypeSpec,
        varScope: VarScope.LOCAL,
      });
    }
    node.labels = this.getLabels(node.stmts);
  }

  private getLabels(stmts: Stmts) {
    const labelLocMap: {[key: string]: AstNodeLocation} = {};
    for (const stmt of stmts) {
      if (stmt.type !== StmtType.LABEL) {
        continue;
      }
      if (labelLocMap[stmt.label]) {
        this.throwError(
          `Label "${stmt.label}" already defined on line ${
            labelLocMap[stmt.label].line
          }`,
          stmt
        );
      }
      labelLocMap[stmt.label] = stmt.loc;
    }
    return Object.keys(labelLocMap);
  }

  /** Stack of UDTs being resolved. Used to detect cycles. */
  private udtStack: Array<Udt> = [];

  /** Resolve UDT type spec using depth first search. */
  visitUdt(udt: Udt) {
    if (udt.typeSpec) {
      return;
    }

    // Check if we have a cycle.
    const udtStackIdx = this.udtStack.indexOf(udt);
    if (udtStackIdx >= 0) {
      const udtsInCycle = [...this.udtStack.slice(udtStackIdx), udt];
      this.throwError(
        'Dependency cycle in user-defined types: ' +
          udtsInCycle.map(({name}) => name).join(' -> '),
        udt
      );
    }

    // Resolve typeSpec of each field.
    this.udtStack.push(udt);
    const typeSpec: UdtTypeSpec = {
      type: DataType.UDT,
      name: udt.name,
      fieldSpecs: [],
    };
    for (const {name: fieldName, typeExpr} of udt.fieldSpecExprs) {
      let fieldTypeSpec: SingularTypeSpec;
      switch (typeExpr.type) {
        case DataTypeExprType.ELEMENTARY:
          fieldTypeSpec =
            typeExpr.typeSpec ?? this.getDefaultTypeSpecFromName(fieldName);
          break;
        case DataTypeExprType.UDT:
          const fieldUdt = this.lookupUdtOrThrow(typeExpr, typeExpr.name);
          this.visitUdt(fieldUdt);
          fieldTypeSpec = fieldUdt.typeSpec!;
          break;
        default:
          this.throwError(
            `Unexpected field type: ${JSON.stringify(typeExpr)}`,
            typeExpr
          );
      }
      typeSpec.fieldSpecs.push({name: fieldName, typeSpec: fieldTypeSpec});
    }

    udt.typeSpec = typeSpec;
  }

  visitProc(node: Proc) {
    this.currentProc = node;
    this.acceptAll(node.stmts);
    this.currentProc = null;
  }

  visitLabelStmt(node: LabelStmt): void {}

  visitDimStmt(node: DimStmt): void {
    if (node.dimType === DimType.STATIC && !this.currentProc) {
      this.throwError(
        'STATIC statement can only be used inside a procedure.',
        node
      );
    }
    for (const varDecl of node.varDecls) {
      const typeSpec = this.getTypeSpecForVarDeclOrParam(varDecl);
      const resolvedSymbol = this.lookupSymbol(varDecl.name);
      if (resolvedSymbol) {
        if (resolvedSymbol.varScope === VarScope.LOCAL) {
          this.throwError(
            `Variable already defined in local scope: "${varDecl.name}"`,
            node
          );
        } else if (
          resolvedSymbol.varScope === VarScope.GLOBAL &&
          node.dimType === DimType.SHARED &&
          !(
            areMatchingSingularTypes(typeSpec, resolvedSymbol.typeSpec) ||
            (isArray(typeSpec) &&
              isArray(resolvedSymbol.typeSpec) &&
              areMatchingSingularTypes(
                typeSpec.elementTypeSpec,
                resolvedSymbol.typeSpec.elementTypeSpec
              ))
          )
        ) {
          this.throwError(
            `Variable already defined in global scope: "${varDecl.name}"`,
            node
          );
        }
        varDecl.symbol = resolvedSymbol;
      } else {
        let symbol: VarSymbol;
        switch (node.dimType) {
          case DimType.SHARED:
            // If this symbol is already defined as a local var at the module level, promote it to
            // global.
            const moduleLocalSymbol = lookupSymbol(
              this.module.localSymbols!,
              varDecl.name
            );
            if (moduleLocalSymbol) {
              symbol = moduleLocalSymbol;
              this.module.localSymbols!.splice(
                this.module.localSymbols!.indexOf(moduleLocalSymbol),
                1
              );
              symbol.varScope = VarScope.GLOBAL;
            } else {
              symbol = {
                name: varDecl.name,
                varType: VarType.VAR,
                typeSpec,
                varScope: VarScope.GLOBAL,
              };
            }
            this.module.globalSymbols!.push(symbol);
            break;
          case DimType.LOCAL:
            symbol = this.createLocalVarSymbol({
              name: varDecl.name,
              typeSpec,
            });
            this.addLocalSymbol(symbol);
            break;
          case DimType.STATIC:
            symbol = {
              name: varDecl.name,
              varType: VarType.STATIC_VAR,
              typeSpec,
              varScope: VarScope.LOCAL,
            };
            this.addLocalSymbol(symbol);
            break;
          default:
            this.throwError(
              `Unknown DimType: ${JSON.stringify(node.dimType)}`,
              node
            );
        }
        varDecl.symbol = symbol;
      }
    }
  }

  visitAssignStmt(node: AssignStmt): void {
    this.accept(node.targetExpr);
    this.accept(node.valueExpr);
    const targetTypeSpec = node.targetExpr.typeSpec!;
    const valueTypeSpec = node.valueExpr.typeSpec!;
    if (!areMatchingSingularTypes(targetTypeSpec, valueTypeSpec)) {
      this.throwError(
        `Cannot assign ${typeSpecName(valueTypeSpec)} value ` +
          `to ${typeSpecName(targetTypeSpec)} variable`,
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
      const symbolProps = {
        name: constDef.name,
        varType: VarType.CONST as const,
        typeSpec: constDef.valueExpr.typeSpec!,
      };
      if (this.currentProc) {
        const symbol: VarSymbol = {...symbolProps, varScope: VarScope.LOCAL};
        this.addLocalSymbol(symbol);
        constDef.symbol = symbol;
      } else {
        const symbol: VarSymbol = {...symbolProps, varScope: VarScope.GLOBAL};
        this.module.globalSymbols!.push(symbol);
        constDef.symbol = symbol;
      }
    }
  }

  visitGotoStmt(node: GotoStmt): void {
    this.lookupLabelOrThrow(
      node,
      this.currentProc ?? this.module,
      node.destLabel
    );
  }

  private requireNumericExpr(...exprs: Array<Expr>) {
    for (const expr of exprs) {
      this.accept(expr);
      if (!isNumeric(expr.typeSpec!)) {
        this.throwError(
          `Expected numeric expression (got ${typeSpecName(expr.typeSpec!)})`,
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
                `expected ${typeSpecName(node.testExpr.typeSpec!)}, ` +
                `got ${typeSpecName(expr.typeSpec!)}`,
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

  visitGosubStmt(node: GosubStmt): void {
    this.lookupLabelOrThrow(
      node,
      this.currentProc ?? this.module,
      node.destLabel
    );
  }

  visitReturnStmt(node: ReturnStmt): void {
    if (node.destLabel) {
      this.lookupLabelOrThrow(
        node,
        this.currentProc ?? this.module,
        node.destLabel
      );
    }
  }

  visitCallStmt(node: CallStmt): void {
    this.acceptAll(node.argExprs);
    const resolvedSub = this.lookupSub(
      node.name,
      node.argExprs.map(({typeSpec}) => typeSpec!)
    );
    if (
      !resolvedSub ||
      (resolvedSub.defType === ProcDefType.MODULE &&
        resolvedSub.proc.type !== ProcType.SUB)
    ) {
      this.throwError(
        `${procTypeName(ProcType.SUB)} not found: "${node.name}"`,
        node
      );
    }
    this.visitProcCall(resolvedSub, node);
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

  visitSwapStmt(node: SwapStmt): void {
    this.accept(node.leftExpr);
    this.accept(node.rightExpr);
    if (
      !areMatchingSingularTypes(
        node.leftExpr.typeSpec!,
        node.rightExpr.typeSpec!
      )
    ) {
      this.throwError(
        `Cannot swap a ${typeSpecName(node.leftExpr.typeSpec!)} ` +
          `variable with a ${typeSpecName(node.rightExpr.typeSpec!)} variable`,
        node
      );
    }
  }

  visitPrintStmt(node: PrintStmt): void {
    if (node.formatExpr) {
      this.accept(node.formatExpr);
      if (!isString(node.formatExpr.typeSpec!)) {
        this.throwError(
          'Expected format expression to be a string, ' +
            `got ${typeSpecName(node.formatExpr.typeSpec!)}`,
          node.formatExpr
        );
      }
    }
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
            'Expected single destination in LINE INPUT statement, ' +
              `got ${node.targetExprs.length}`,
            node
          );
        }
        this.accept(node.targetExprs[0]);
        if (!isString(node.targetExprs[0].typeSpec!)) {
          this.throwError(
            `Expected string destination in LINE INPUT staement, got ${
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

  visitDefTypeStmt(node: DefTypeStmt): void {
    if (this.currentProc) {
      this.throwError(
        `DEFtype statements are only allowed at module level`,
        node
      );
    }
    for (const range of node.ranges) {
      const [minPrefix, maxPrefix] = [
        range.minPrefix.toLowerCase(),
        range.maxPrefix.toLowerCase(),
      ];
      if (
        ![minPrefix, maxPrefix].every(
          (p) => p.match(/^[a-z]$/) || minPrefix > maxPrefix
        )
      ) {
        this.throwError(`Invalid DEFtype range`, range);
      }
      for (let c = minPrefix.charCodeAt(0); c <= maxPrefix.charCodeAt(0); ++c) {
        this.defTypeMap[String.fromCharCode(c)] = node.typeSpec;
      }
    }
  }

  visitDataStmt(node: DataStmt): void {
    if (this.currentProc) {
      this.throwError(`DATA statement must be at module level`, node);
    }
  }

  visitReadStmt(node: ReadStmt): void {
    if (node.targetExprs.length === 0) {
      this.throwError('Empty READ statement', node);
    }
    for (const targetExpr of node.targetExprs) {
      this.accept(targetExpr);
      if (!isElementaryType(targetExpr.typeSpec!)) {
        this.throwError(
          'Expected elementary type variable in READ statement ' +
            `(got ${typeSpecName(targetExpr.typeSpec!)})`,
          targetExpr
        );
      }
    }
  }

  visitRestoreStmt(node: RestoreStmt): void {
    if (node.destLabel) {
      this.lookupLabelOrThrow(node, this.module, node.destLabel);
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
      let proc = this.lookupFn(node.name, []);
      if (proc) {
        const fnCallExpr: FnCallExpr = {
          type: ExprType.FN_CALL,
          name: node.name,
          argExprs: [],
          loc: node.loc,
        };
        this.accept(fnCallExpr);
        Object.assign(node, fnCallExpr);
        return;
      }

      symbol = this.createLocalVarSymbol({
        name: node.name,
        // If this VarRefExpr is nested inside a SubscriptExpr, visitSubScriptExpr() will set the
        // typeSpec for this VarRefExpr based on the index expressions. So we should respect that
        // here.
        typeSpec: node.typeSpec ?? this.getDefaultTypeSpecFromName(node.name),
      });
      this.addLocalSymbol(symbol);
    }
    [node.typeSpec, node.symbol] = [symbol.typeSpec, symbol];
  }

  visitFnCallExpr(node: FnCallExpr): void {
    this.acceptAll(node.argExprs);

    // Try resolving the name as a function.
    const resolvedFn = this.lookupFn(
      node.name,
      node.argExprs.map(({typeSpec}) => typeSpec!)
    );
    if (resolvedFn) {
      if (
        resolvedFn.defType === ProcDefType.MODULE &&
        resolvedFn.proc.type !== ProcType.FN
      ) {
        this.throwError(
          `A ${procTypeName(
            resolvedFn.proc.type
          )} cannot be used in an expression: "${node.name}"`,
          node
        );
      }
      this.visitProcCall(resolvedFn, node);
      node.typeSpec = resolvedFn.returnTypeSpec!;
      return;
    }

    // Try resolving as a subscript expression.
    const subscriptExpr: SubscriptExpr = {
      type: ExprType.SUBSCRIPT,
      arrayExpr: {
        type: ExprType.VAR_REF,
        name: node.name,
        loc: node.loc,
      },
      indexExprs: node.argExprs,
      loc: node.loc,
    };
    this.accept(subscriptExpr);
    Object.assign(node, subscriptExpr);
  }

  visitBinaryOpExpr(node: BinaryOpExpr): void {
    this.accept(node.leftExpr);
    this.accept(node.rightExpr);
    const leftTypeSpec = node.leftExpr.typeSpec!;
    const rightTypeSpec = node.rightExpr.typeSpec!;
    const errorMessage =
      `Incompatible types for ${node.op} operator: ` +
      `${typeSpecName(leftTypeSpec)} and ${typeSpecName(rightTypeSpec)}`;
    const requireNumericOperands = () => {
      if (!(isNumeric(leftTypeSpec) && isNumeric(rightTypeSpec))) {
        this.throwError(errorMessage, node);
      }
    };
    const useCoercedNumericType = () => {
      node.typeSpec = this.coerceNumericTypes(leftTypeSpec, rightTypeSpec);
    };
    switch (node.op) {
      case BinaryOp.ADD:
        if (isString(leftTypeSpec) && isString(rightTypeSpec)) {
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

  visitSubscriptExpr(node: SubscriptExpr): void {
    // Hack: treat empty parens (used to pass array to procedures) as reference to the array
    // variable itself.
    if (node.indexExprs.length === 0) {
      this.accept(node.arrayExpr);
      Object.assign(node, node.arrayExpr);
      return;
    }

    this.acceptAll(node.indexExprs);
    for (let i = 0; i < node.indexExprs.length; ++i) {
      const indexExpr = node.indexExprs[i];
      if (!isNumeric(indexExpr.typeSpec!)) {
        this.throwError(
          `Array index #${i + 1} should be numeric instead of ${
            indexExpr.typeSpec!.type
          }`,
          indexExpr
        );
      }
    }

    // Add typeSpec hint for arrayExpr. This will be used to create the underlying variable symbol
    // if not already found.
    node.arrayExpr.typeSpec = arraySpec(
      this.getDefaultTypeSpecFromName(node.arrayExpr.name),
      node.indexExprs.map(() => DEFAULT_DIMENSION_SPEC)
    );
    this.accept(node.arrayExpr);

    const arrayTypeSpec = node.arrayExpr.typeSpec!;
    if (!isArray(arrayTypeSpec)) {
      this.throwError(
        'Expected array variable in subscript expression, ' +
          `got ${typeSpecName(node.arrayExpr.typeSpec!)}`,
        node.arrayExpr
      );
    }
    if (
      arrayTypeSpec.dimensionSpecs.length && // Dimension is unknown for array arguments.
      arrayTypeSpec.dimensionSpecs.length !== node.indexExprs.length
    ) {
      this.throwError(
        'Wrong number of index expressions: ' +
          `expected ${arrayTypeSpec.dimensionSpecs.length}, ` +
          `got ${node.indexExprs.length}`,
        node
      );
    }

    node.typeSpec = node.arrayExpr.typeSpec.elementTypeSpec;
  }

  visitMemberExpr(node: MemberExpr): void {
    this.accept(node.udtExpr);
    const udtTypeSpec = node.udtExpr.typeSpec!;
    if (!isUdt(udtTypeSpec)) {
      this.throwError(
        `Expected user-defined type in member expression, got ${typeSpecName(
          udtTypeSpec
        )}`,
        node
      );
    }
    const fieldSpec = lookupSymbol(udtTypeSpec.fieldSpecs, node.fieldName);
    if (!fieldSpec) {
      this.throwError(
        `Field "${node.fieldName}" does not exist ` +
          `on type "${typeSpecName(udtTypeSpec)}"`,
        node
      );
    }
    node.typeSpec = fieldSpec.typeSpec;
  }

  private visitProcCall(
    resolvedProc: ResolvedFn | ResolvedSub,
    node: FnCallExpr | CallStmt
  ) {
    node.argTypeProps = [];
    let paramTypeSpecs: Array<DataTypeSpec>;
    switch (resolvedProc.defType) {
      case ProcDefType.BUILTIN:
        paramTypeSpecs = resolvedProc.builtinProc.paramTypeSpecs;
        break;
      case ProcDefType.MODULE:
        paramTypeSpecs = resolvedProc.proc.paramSymbols!.map(
          ({typeSpec}) => typeSpec!
        );
        break;
      default:
        this.throwError(
          `Unknown FnDefType: ${JSON.stringify(resolvedProc)}`,
          node
        );
    }
    node.procDefType = resolvedProc.defType;

    if (paramTypeSpecs.length !== node.argExprs.length) {
      this.throwError(
        `Incorrect number of arguments to "${node.name}": ` +
          `expected ${paramTypeSpecs.length}, got ${node.argExprs.length}`,
        node
      );
    }
    for (let i = 0; i < node.argExprs.length; ++i) {
      const paramTypeSpec = paramTypeSpecs[i];
      const argExpr = node.argExprs[i];
      const argTypeSpec = argExpr.typeSpec!;
      const shouldPassByRef =
        isLhsExpr(argExpr) &&
        // Constants cannot be allowed to be modified by the proc, so must use pass-by-value.
        !(
          argExpr.type === ExprType.VAR_REF &&
          argExpr.symbol!.varType === VarType.CONST
        ) &&
        // For built-in procs, we always pass by value in order to take advantage of automatic type
        // casting (e.g. single -> integer).
        resolvedProc.defType !== ProcDefType.BUILTIN;
      let isCompatible: boolean;
      if (shouldPassByRef) {
        // If argument is an LHS expression, the types must match exactly as it may be assigned to
        // from inside the proc.
        isCompatible =
          _.isEqual(paramTypeSpec, argTypeSpec) ||
          (isArray(paramTypeSpec) &&
            isArray(argTypeSpec) &&
            _.isEqual(
              paramTypeSpec.elementTypeSpec,
              argTypeSpec.elementTypeSpec
            ));
      } else {
        // If argument is not an LHS expression, the types just need to be generally compatible.
        isCompatible =
          areMatchingSingularTypes(paramTypeSpec, argTypeSpec) ||
          (isArray(paramTypeSpec) &&
            isArray(argTypeSpec) &&
            (areMatchingSingularTypes(
              paramTypeSpec.elementTypeSpec,
              argTypeSpec.elementTypeSpec
            ) ||
              // Allow builtins to accept arrays of any element type.
              resolvedProc.defType === ProcDefType.BUILTIN));
      }
      if (!isCompatible) {
        this.throwError(
          `Incompatible argument ${i + 1} to function "${node.name}": ` +
            `expected ${typeSpecName(paramTypeSpec)}, ` +
            `got ${typeSpecName(argTypeSpec)}`,
          node
        );
      }
      node.argTypeProps.push({paramTypeSpec, shouldPassByRef});
    }
  }

  /** Computes the output numeric type after an arithmetic operation. */
  private coerceNumericTypes(...typeSpecs: Array<DataTypeSpec>): DataTypeSpec {
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
    if (typeSpecs.length === 0) {
      throw new Error('Missing arguments');
    }
    if (!typeSpecs.every(isNumeric)) {
      throw new Error(`Expected numeric types: ${JSON.stringify(typeSpecs)}`);
    }
    let resultTypeSpec = typeSpecs[0];
    for (let i = 1; i < typeSpecs.length; ++i) {
      const matchingRule = RULES.find(
        ({operands: [typeSpec1, typeSpec2]}) =>
          _.isEqual(typeSpec1, resultTypeSpec) &&
          _.isEqual(typeSpec2, typeSpecs[i])
      );
      if (matchingRule) {
        resultTypeSpec = matchingRule.result;
      } else {
        throw new Error(
          'Unknown numeric type combination: ' +
            `${typeSpecName(resultTypeSpec)} and ${typeSpecName(typeSpecs[i])}`
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

  private getTypeSpecForVarDeclOrParam(
    node: AstNodeBase & {name: string; typeExpr: DataTypeExpr}
  ): DataTypeSpec {
    const {name, typeExpr: typeExpr} = node;
    switch (typeExpr.type) {
      case DataTypeExprType.ELEMENTARY:
        if (!typeExpr.typeSpec) {
          typeExpr.typeSpec = this.getDefaultTypeSpecFromName(name);
        }
        return typeExpr.typeSpec;
      case DataTypeExprType.ARRAY:
        for (const {minIdxExpr, maxIdxExpr} of typeExpr.dimensionSpecExprs) {
          const idxExprs = [...(minIdxExpr ? [minIdxExpr] : []), maxIdxExpr];
          this.acceptAll(idxExprs);
          for (const idxExpr of idxExprs) {
            if (!isNumeric(idxExpr.typeSpec!)) {
              this.throwError(
                `Array dimension size must be numeric, not ${
                  idxExpr.typeSpec!.type
                }`,
                idxExpr
              );
            }
          }
        }
        if (typeExpr.elementTypeExpr) {
          if (!isSingularTypeExpr(typeExpr.elementTypeExpr)) {
            this.throwError(
              `Invalid array element type: ${JSON.stringify(
                typeExpr.elementTypeExpr
              )}`,
              typeExpr.elementTypeExpr
            );
          }
        } else {
          typeExpr.elementTypeExpr = {
            type: DataTypeExprType.ELEMENTARY,
            typeSpec: this.getDefaultTypeSpecFromName(name),
            loc: typeExpr.loc,
          };
        }
        return {
          type: DataType.ARRAY,
          elementTypeSpec: this.getTypeSpecForVarDeclOrParam({
            ...node,
            typeExpr: typeExpr.elementTypeExpr,
          }) as SingularTypeSpec,
          dimensionSpecs: typeExpr.dimensionSpecExprs.map(() => [0, 0]),
        };
      case DataTypeExprType.UDT:
        const udt = this.lookupUdtOrThrow(typeExpr, typeExpr.name);
        return udt.typeSpec!;
      default:
        this.throwError(
          `Unknown DataTypeExpr type: ${JSON.stringify(typeExpr)}`,
          node
        );
    }
  }

  private getDefaultTypeSpecFromName(name: string) {
    return (
      TYPE_SUFFIX_MAP[name[name.length - 1]] ??
      this.defTypeMap[name[0].toLowerCase()]
    );
  }

  private lookupFn(
    name: string,
    argTypeSpecs: Array<DataTypeSpec>
  ): ResolvedFn | null {
    const proc = lookupSymbol(this.module.procs, name);
    if (proc) {
      return {
        defType: ProcDefType.MODULE,
        proc,
        returnTypeSpec: proc.type === ProcType.FN ? proc.returnTypeSpec! : null,
      };
    }
    const builtinProc = lookupBuiltin(BUILTIN_FNS, name, argTypeSpecs, {
      // This allows us to throw a more useful error message in visitProcCall().
      shouldReturnIfArgTypeMismatch: true,
    });
    if (builtinProc) {
      return {
        defType: ProcDefType.BUILTIN,
        builtinProc,
        returnTypeSpec: builtinProc.returnTypeSpec,
      };
    }
    return null;
  }

  private lookupSub(
    name: string,
    argTypeSpecs: Array<DataTypeSpec>
  ): ResolvedSub | null {
    const proc = lookupSymbol(this.module.procs, name);
    if (proc) {
      return {
        defType: ProcDefType.MODULE,
        proc,
      };
    }
    const builtinProc = lookupBuiltin(BUILTIN_SUBS, name, argTypeSpecs, {
      // This allows us to throw a more useful error message in visitProcCall().
      shouldReturnIfArgTypeMismatch: true,
    });
    if (builtinProc) {
      return {
        defType: ProcDefType.BUILTIN,
        builtinProc,
      };
    }
    return null;
  }

  private lookupUdtOrThrow<T extends AstNodeBase>(node: T, name: string) {
    const udt = lookupSymbol(this.module.udts, name);
    if (!udt) {
      this.throwError(`Type not found: "${name}"`, node);
    }
    return udt;
  }

  private setUpDefTypeMap() {
    for (let c = 'a'.charCodeAt(0); c <= 'z'.charCodeAt(0); ++c) {
      this.defTypeMap[String.fromCharCode(c)] = singleSpec();
    }
    this.acceptAll(_.filter(this.module.stmts, ['type', StmtType.DEF_TYPE]));
  }

  private lookupLabelOrThrow<T extends AstNodeBase>(
    node: T,
    context: Module | Proc,
    label: string
  ) {
    if (context.labels!.indexOf(label) < 0) {
      this.throwError(`Label not found: "${label}"`, node);
    }
  }

  /** The current proc being visited, or null if currently visiting module-level nodes. */
  private currentProc: Proc | null = null;

  /** Default type based on first letter of identifier. */
  private defTypeMap: {[key: string]: ElementaryTypeSpec} = {};
}

export default function runSemanticAnalysis(
  module: Module,
  opts: SemanticAnalyzerOpts = {}
) {
  return new SemanticAnalyzer(module, opts).run();
}
