/// <reference path="typings/express/express.d.ts" />
"use strict";
var express = require('express');
var odata_v4_inmemory_1 = require('odata-v4-inmemory');
var app = express();
var port = process.env.PORT || 1337;
app.get("/api/products", function (req, res) {
    var data = require('./data/products.json').value;
    if (req.query.$filter) {
        var filterFn = odata_v4_inmemory_1.createFilter(req.query.$filter);
        data = data.filter(filterFn);
    }
    res.json(data);
});
app.listen(port, function () {
    console.log("app is running on port: " + port);
});
