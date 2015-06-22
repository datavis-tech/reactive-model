var ReactiveModel = require("../reactive-model.js");
var ReactiveGraph = ReactiveModel.ReactiveGraph;
var ReactiveFunction = ReactiveModel.ReactiveFunction;
var assert = require("assert");

function increment(x){
  return x + 1;
}

describe("ReactiveGraph", function (){
  it("should throw an error when reactive function added without inNodes or outNodes", function (){
    var reactiveGraph = new ReactiveGraph();
    var reactiveFunction = new ReactiveFunction(["a"], "b", increment);

    assert.throws( function (){
      reactiveGraph.addReactiveFunction(reactiveFunction);
    }, Error);
  });

  it("should generate incremental unique node ids local to the instance", function (){

    var reactiveGraphA = new ReactiveGraph();
    assert.equal(reactiveGraphA.makeNode(), 0);
    assert.equal(reactiveGraphA.makeNode(), 1);
    assert.equal(reactiveGraphA.makeNode(), 2);

    var reactiveGraphB = new ReactiveGraph();
    assert.equal(reactiveGraphB.makeNode(), 0);
    assert.equal(reactiveGraphB.makeNode(), 1);
    assert.equal(reactiveGraphB.makeNode(), 2);
  });

  it("should assign nodes to reactive function input and output properties", function (){
    var reactiveGraph = new ReactiveGraph();
    var reactiveFunction = new ReactiveFunction(["a"], "b", increment);

    var a = 3;
    var b;
    var getterSettersByProperty = {
      a: function(value){ if (!arguments.length) { return a; } a = value; },
      b: function(value){ if (!arguments.length) { return b; } b = value; }
    };

    reactiveGraph.assignNodes(reactiveFunction, getterSettersByProperty);

    assert.equal(reactiveFunction.inNodes.length, 1);
    assert.equal(reactiveFunction.inNodes[0], 0);
    assert.equal(reactiveFunction.outNode, 1);
  });

  //it("should digest", function (){
  //      reactiveFunction = new ReactiveFunction(["a"], "b", increment);

  //  reactiveGraph.assignNodes(reactiveFunction);

  //  ReactiveGraph.digest();

  //  assert.equal(b, 3);

  //});
});
