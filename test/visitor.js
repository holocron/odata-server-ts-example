var Visitor = require('../lib/Visitor').Visitor
var expect = require('chai').expect

describe("inmemory visitor", () => {
   var v = new Visitor()
   var ast
   var f

  beforeEach(function() {
    var match
     if (match = this.currentTest.title.match(/expression\:  ?(.*)/)) {
       f = v.Visit(ast = v.buildAst(match[1]))
     }
  })

  it("should have a tree first", () => {
    var ast = v.buildAst("A eq 1")
    expect(ast).to.exist
  })

  it("expression: 1 eq 1", () => {
      expect(f()).to.be.true
  })

  it("expression: A eq 1", () => {
      expect(f({A:1})).to.be.true
  })


  it("expression: A", () => {
      expect(f({A:1})).to.equal(1)
  })

  it("expression: A/b", () => {
      expect(f({A:{b:42}})).to.equal(42)
  })

  it("expression: A/b eq 1", () => {
      expect(f({A:{b:1}})).to.equal(true)
      expect(f({A:{b:2}})).to.equal(false)
  })

  it("expression: A/b eq A/b", () => {
      expect(f({A:{b:1}})).to.equal(true)
  })

  it("expression: A/$count", () => {
      expect(f({A:[1,2,3]})).to.equal(3)
  })

  it("expression: A/$count eq 3", () => {
      expect(f({A:[1,2,3]})).to.equal(true)
  })

  it("expression: A/$count gt 2", () => {
      expect(f({A:[1,2,3]})).to.equal(true)
  })

  it("expression: A and B", () => {
      expect(f({A:1, B:2})).to.equal(2)
  })

  it("expression: (A and B)", () => {
      expect(f({A:1, B:2})).to.equal(true)
  })


  it("expression: A/$count gt 2 and A/$count lt 4", () => {
      expect(f({A:[1,2,3]})).to.equal(true)
  })

  it("expression: (A/$count gt 2) and A/$count lt 3", () => {
      expect(f({A:[1,2,3]})).to.equal(false)
  })

  it("expression: A add B", () => {
      expect(f({A:1, B:2})).to.equal(3)
  })

  it("expression: A add 'B'", () => {
      expect(f({A:1, B:2})).to.equal('1B')
  })

  it("expression: 'A' add 'B'", () => {
      expect(f({A:1, B:2})).to.equal('AB')
  })

  it("expression: A/$count add B/$count eq 7", () => {
      expect(f({A:[1,2,3], B:[1,2,3,4]})).to.equal(true)
  })

})
