"use strict";
var lexer_1 = require('../node_modules/odata-v4-parser/lib/lexer');
var parser_1 = require('../node_modules/odata-v4-parser/lib/parser');
var p = new parser_1.Parser();
exports.ODataMethodMap = {
    round: function (v) { return Math.round(v); },
    indexof: function (v, i) { return v.indexOf && v.indexOf(i); },
    substring: function (v, i) { return v.substr(i - 1); }
};
var Visitor = (function () {
    function Visitor() {
    }
    Visitor.buildFilterFunction = function (expression) {
        return new Visitor().Visit(p.filter(expression), {});
    };
    Visitor.buildAst = function (expression) {
        return p.filter(expression);
    };
    Visitor.prototype.Visit = function (node, context) {
        //console.log("Visiting: ", node.type)
        switch (node.type) {
            //these are auto handled by visitor bubbling
            case lexer_1.TokenType.CollectionPathExpression:
            case lexer_1.TokenType.LambdaPredicateExpression:
            case lexer_1.TokenType.MemberExpression:
            case lexer_1.TokenType.PropertyPathExpression:
            case lexer_1.TokenType.SingleNavigationExpression:
            case lexer_1.TokenType.CommonExpression:
            case undefined:
                break;
            default:
                var fun = this[("Visit" + node.type)];
                if (fun) {
                    return fun.call(this, node, context);
                }
                console.log("Unhandled node type, falling back: " + node.type);
        }
        return this.Visit(node.value, context);
    };
    //todo fix AST so that we dont need this
    Visitor.prototype.VisitFirstMemberExpression = function (node, context) {
        if (Array.isArray(node.value)) {
            var _a = node.value, current = _a[0], next = _a[1];
            return this.VisitODataIdentifier({ value: { current: current, next: next } }, context);
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
    Visitor.prototype.VisitLambdaVariableExpression = function (node, context) {
        return function (a) { return a; };
    };
    Visitor.prototype.VisitCountExpression = function (node, context) {
        return function (a) { return (a && a.length) || 0; };
    };
    Visitor.prototype.VisitAllExpression = function (node, context) {
        var predicate = this.Visit(node.value.predicate, context);
        return function (a) { return a.every && a.every(predicate); };
    };
    Visitor.prototype.VisitAnyExpression = function (node, context) {
        var predicate = this.Visit(node.value.predicate, context);
        return function (a) { return a.some && a.some(predicate); };
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
    Visitor.prototype.VisitImplicitVariableExpression = function (node, context) {
        return function (a) { return a; };
    };
    Visitor.prototype.VisitAndExpression = function (node, context) {
        var _a = this.VisitBinaryExpression(node, context), left = _a[0], right = _a[1];
        return function (a) { return left(a) && right(a); };
    };
    Visitor.prototype.VisitAddExpression = function (node, context) {
        var _a = this.VisitBinaryExpression(node, context), left = _a[0], right = _a[1];
        return function (a) { return left(a) + right(a); };
    };
    Visitor.prototype.getLiteral = function (node) {
        switch (node.value) {
            case "Edm.SByte": return parseInt(node.raw);
            case "Edm.Boolean": return node.raw === "true";
            case "Edm.String": return node.raw.replace(/'/g, '');
            default:
                console.log("unknown value type:" + node.value);
        }
        return node.raw;
    };
    Visitor.prototype.VisitLiteral = function (node, context) {
        var _this = this;
        return function (a) { return _this.getLiteral(node); };
    };
    Visitor.prototype.VisitMethodCallExpression = function (node, context) {
        var _this = this;
        var method = exports.ODataMethodMap[node.value.method];
        var params = node.value.parameters.map(function (p) { return _this.Visit(p, context); });
        return function (a) { return method.apply(_this, params.map(function (p) { return p(a); })); };
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
        var _a = this.VisitBinaryExpression(node, context), left = _a[0], right = _a[1];
        return function (a) { return left(a) || right(a); };
    };
    return Visitor;
}());
exports.Visitor = Visitor;
