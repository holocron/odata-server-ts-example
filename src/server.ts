/// <reference path="../typings/express/express.d.ts" />
import { Request, Response} from 'express'
import { Visitor } from './Visitor'
import * as express from 'express'

const app = express()
const port = process.env.PORT || 1337;

app.get("/api/products", (req: Request, res: Response) => {
  const visitor = new Visitor()
  const ast = visitor.buildAst(req.query.$filter)
  res.json({
    "result": ast
  })
})

app.get("/odata/products", (req: Request, res: Response) => {
  const visitor = new Visitor()
  const filter = visitor.buildFilterFunction(req.query.$filter)

  res.json({
    "result": filter.toString()
  })
})

app.listen(port, () => {
    console.log(`service listing in ${port}`);
})