"use strict";
var lexer_1 = require('../node_modules/odata-v4-parser/lib/lexer');
var parser_1 = require('../node_modules/odata-v4-parser/lib/parser');
var p = new parser_1.Parser();
var Visitor = (function () {
    function Visitor() {
    }
    Visitor.prototype.buildAst = function (expression) {
        return p.filter(expression);
    };
    Visitor.prototype.Visit = function (node, context) {
        //console.log("Visiting: ",node, node.type)
        switch (node.type) {
            case lexer_1.TokenType.EqualsExpression: return this.VisitEqualsExpression(node, context);
            case lexer_1.TokenType.Filter: return this.VisitFilter(node, context);
            case lexer_1.TokenType.Literal: return this.VisitLiteral(node, context);
            case lexer_1.TokenType.ODataIdentifier: return this.VisitODataIdentifier(node, context);
            case lexer_1.TokenType.OrExpression: return this.VisitOrExpression(node, context);
            case lexer_1.TokenType.CountExpression: return this.VisitCountExpression(node, context);
            case lexer_1.TokenType.GreaterThanExpression: return this.VisitGreaterThanExpression(node, context);
            case lexer_1.TokenType.LesserThanExpression: return this.VisitLesserThanExpression(node, context);
            case lexer_1.TokenType.AndExpression: return this.VisitAndExpression(node, context);
            case lexer_1.TokenType.AddExpression: return this.VisitAddExpression(node, context);
            case lexer_1.TokenType.BoolParenExpression: return this.VisitBoolParenExpression(node, context);
            case lexer_1.TokenType.CollectionPathExpression:
            case lexer_1.TokenType.FirstMemberExpression:
            case lexer_1.TokenType.MemberExpression:
            case lexer_1.TokenType.PropertyPathExpression:
            case lexer_1.TokenType.SingleNavigationExpression:
            case lexer_1.TokenType.CommonExpression:
            case undefined:
                break;
            default:
                console.warn("No visitor for: " + node.type);
        }
        return this.Visit(node.value, context);
    };
    Visitor.prototype.VisitBinaryExpression = function (node, context) {
        return [this.Visit(node.value.left, context), this.Visit(node.value.right, context)];
    };
    Visitor.prototype.VisitBoolParenExpression = function (node, context) {
        var inner = this.Visit(node.value, context);
        return function (a) { return !!inner(a); };
    };
    Visitor.prototype.VisitCountExpression = function (node, context) {
        return function (a) { return (a && a.length) || 0; };
    };
    Visitor.prototype.VisitFilter = function (node, context) {
        var predicate = this.Visit(node.value, context);
        return function (a) { return !!predicate(a); };
    };
    Visitor.prototype.VisitEqualsExpression = function (node, context) {
        var _a = this.VisitBinaryExpression(node, context), left = _a[0], right = _a[1];
        return function (a) { return left(a) === right(a); };
    };
    Visitor.prototype.VisitGreaterThanExpression = function (node, context) {
        var _a = this.VisitBinaryExpression(node, context), left = _a[0], right = _a[1];
        return function (a) { return left(a) > right(a); };
    };
    Visitor.prototype.VisitLesserThanExpression = function (node, context) {
        var _a = this.VisitBinaryExpression(node, context), left = _a[0], right = _a[1];
        return function (a) { return left(a) < right(a); };
    };
    Visitor.prototype.VisitAndExpression = function (node, context) {
        var _a = this.VisitBinaryExpression(node, context), left = _a[0], right = _a[1];
        return function (a) { return left(a) && right(a); };
    };
    Visitor.prototype.VisitAddExpression = function (node, context) {
        var _a = this.VisitBinaryExpression(node, context), left = _a[0], right = _a[1];
        return function (a) { return left(a) + right(a); };
    };
    Visitor.prototype.VisitLiteral = function (node, context) {
        var convert;
        switch (node.value) {
            case "Edm.SByte":
                convert = function (v) { return parseInt(v); };
                break;
            case "Edm.String":
                convert = function (v) { return v.replace(/'/g, ''); };
                break;
            default:
                console.log("unknown value type:" + node.value);
                break;
        }
        return function (a) { return convert(node.raw); };
    };
    Visitor.prototype.VisitODataIdentifier = function (node, context) {
        if (node.value.name) {
            return function (a) { return a[node.value.name]; };
        }
        var current = this.Visit(node.value.current, context);
        var next = this.Visit(node.value.next, context);
        return function (a) { return next(current(a) || {}); };
    };
    Visitor.prototype.VisitOrExpression = function (node, context) {
        var left = this.Visit(node.value.left, context);
        var right = this.Visit(node.value.right, context);
        return function (a) { return left(a) || right(a); };
    };
    Visitor.prototype.VisitUnknown = function (node, context) {
    };
    return Visitor;
}());
exports.Visitor = Visitor;
