import {
  AssignStmt,
  AstNode,
  BinaryOpExpr,
  ExprType,
  LabelStmt,
  LiteralExpr,
  Module,
  PrintStmt,
  StmtType,
  UnaryOpExpr,
  VarRefExpr,
} from './ast';

/** Base class for an AST visitor. */
export default abstract class AstVisitor<T = any> {
  protected abstract visitModule(module: Module): T;

  protected abstract visitLabelStmt(node: LabelStmt): T;
  protected abstract visitAssignStmt(node: AssignStmt): T;
  protected abstract visitPrintStmt(node: PrintStmt): T;

  protected abstract visitLiteralExpr(node: LiteralExpr): T;
  protected abstract visitVarRefExpr(node: VarRefExpr): T;
  protected abstract visitBinaryOpExpr(node: BinaryOpExpr): T;
  protected abstract visitUnaryOpExpr(node: UnaryOpExpr): T;

  protected accept(node: AstNode): T {
    switch (node.type) {
      case StmtType.LABEL:
        return this.visitLabelStmt(node);
      case StmtType.ASSIGN:
        return this.visitAssignStmt(node);
      case StmtType.PRINT:
        return this.visitPrintStmt(node);
      case ExprType.LITERAL:
        return this.visitLiteralExpr(node);
      case ExprType.VAR_REF:
        return this.visitVarRefExpr(node);
      case ExprType.BINARY_OP:
        return this.visitBinaryOpExpr(node);
      case ExprType.UNARY_OP:
        return this.visitUnaryOpExpr(node);
      default:
        throw new Error(`Unknown node type: ${JSON.stringify(node)}`);
    }
  }
}
