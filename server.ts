/// <reference path="typings/express/express.d.ts" />

import { Request, Response } from 'express'
import * as express from 'express'
import { createFilter } from 'odata-v4-inmemory'

var app = express()
var port = process.env.PORT || 1337;

app.get("/api/products", (req: Request, res:Response) => {
  let data = require('./data/products.json').value
  if (req.query.$filter) {
    const filterFn = createFilter(req.query.$filter)
    data = data.filter(filterFn)
  }
  res.json(data)
})

app.listen(port, () => {
  console.log("app is running on port: " + port);
})