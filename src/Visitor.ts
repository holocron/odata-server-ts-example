import { TokenType, Token } from '../node_modules/odata-v4-parser/lib/lexer'
import { Parser } from '../node_modules/odata-v4-parser/lib/parser'
var p = new Parser()


export class Visitor {

  constructor() {

  }

  buildAst(expression: string) {
    return p.filter(expression)
  }

  Visit(node: Token, context: any) {
    //console.log("Visiting: ",node, node.type)
    switch (node.type) {
      case TokenType.EqualsExpression: return this.VisitEqualsExpression(node, context)
      case TokenType.Filter: return this.VisitFilter(node, context)
      case TokenType.Literal: return this.VisitLiteral(node, context)
      case TokenType.ODataIdentifier: return this.VisitODataIdentifier(node, context)
      case TokenType.OrExpression: return this.VisitOrExpression(node, context)
      case TokenType.CountExpression: return this.VisitCountExpression(node, context)
      case TokenType.GreaterThanExpression: return this.VisitGreaterThanExpression(node, context)
      case TokenType.LesserThanExpression: return this.VisitLesserThanExpression(node, context)
      case TokenType.AndExpression: return this.VisitAndExpression(node, context)
      case TokenType.AddExpression: return this.VisitAddExpression(node, context)
      case TokenType.BoolParenExpression: return this.VisitBoolParenExpression(node, context)
      case TokenType.CollectionPathExpression:
      case TokenType.FirstMemberExpression:
      case TokenType.MemberExpression:
      case TokenType.PropertyPathExpression:
      case TokenType.SingleNavigationExpression:
      case TokenType.CommonExpression:
      case undefined:
        break;
      default:
        console.warn("No visitor for: " + node.type)
    }
    return this.Visit(node.value, context)
  }


  private VisitBinaryExpression(node: Token, context: any) {
    return [this.Visit(node.value.left, context), this.Visit(node.value.right, context)]
  }
  protected VisitBoolParenExpression(node: Token, context: any) {
    var inner = this.Visit(node.value, context)
    return a => !!inner(a)
  }

  protected VisitCountExpression(node: Token, context: any) {
    return a => (a && a.length) || 0
  }
  protected VisitFilter(node: Token, context: any) {
    var predicate = this.Visit(node.value, context)
    return a => !!predicate(a)
  }

  protected VisitEqualsExpression(node: Token, context: any) {
    var [left, right] = this.VisitBinaryExpression(node, context)
    return a => left(a) === right(a)
  }

  protected VisitGreaterThanExpression(node: Token, context: any) {
    var [left, right] = this.VisitBinaryExpression(node, context)
    return a => left(a) > right(a)
  }

  protected VisitLesserThanExpression(node: Token, context: any) {
    var [left, right] = this.VisitBinaryExpression(node, context)
    return a => left(a) < right(a)
  }


  protected VisitAndExpression(node: Token, context: any) {
    var [left, right] = this.VisitBinaryExpression(node, context)
    return a => left(a) && right(a)
  }

  protected VisitAddExpression(node: Token, context: any) {
    var [left, right] = this.VisitBinaryExpression(node, context)
    return a => left(a) + right(a)
  }


  protected VisitLiteral(node: Token, context: any) {
    let convert
    switch(node.value) {
      case "Edm.SByte": convert = v => parseInt(v); break;
      case "Edm.String":
        convert = v => v.replace(/'/g,'');
        break;
      default:
        console.log("unknown value type:" + node.value)
        break;
    }
    return a => convert(node.raw)
  }


  protected VisitODataIdentifier(node: Token, context: any) {
    if (node.value.name) {
      return a => a[node.value.name]
    }
    const current = this.Visit(node.value.current, context)
    const next = this.Visit(node.value.next, context)
    return a => next(current(a) || {})
  }

  protected VisitOrExpression(node: Token, context: any) {
    var left = this.Visit(node.value.left, context)
    var right = this.Visit(node.value.right, context)
    return a => left(a) || right(a)
  }

  VisitUnknown(node, context) {

  }

}



