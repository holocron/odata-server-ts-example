"use strict";
var Visitor_1 = require('./Visitor');
var express = require('express');
var app = express();
var port = process.env.PORT || 1337;
app.get("/api/products", function (req, res) {
    var visitor = new Visitor_1.Visitor();
    var ast = visitor.buildAst(req.query.$filter);
    res.json({
        "result": ast
    });
});
app.listen(port, function () {
    console.log("service listing in " + port);
});
