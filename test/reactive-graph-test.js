var ReactiveModel = require("../reactive-model.js");
var ReactiveGraph = ReactiveModel.ReactiveGraph;
var ReactiveFunction = ReactiveModel.ReactiveFunction;
var assert = require("assert");
require("source-map-support").install();

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

  function createGetterSetters(){
    var a = 3;
    var b;
    return {
      a: function(value){
        if (!arguments.length) { return a; }
        a = value;
      },
      b: function(value){
        if (!arguments.length) { return b; }
        b = value;
      }
    };
  }

  function assignNodes(reactiveGraph, reactiveFunction, getterSettersByProperty){
    reactiveFunction.inNodes = reactiveFunction.inProperties.map(function (property){
      return reactiveGraph.makePropertyNode(getterSettersByProperty[property]);
    });
    reactiveFunction.node = reactiveGraph.makeReactiveFunctionNode(reactiveFunction);
    reactiveFunction.outNode = reactiveGraph
      .makePropertyNode(getterSettersByProperty[reactiveFunction.outProperty]);
  }

  it("should add edges to the dependency graph", function (){
    var reactiveGraph = new ReactiveGraph();
    var reactiveFunction = new ReactiveFunction(["a"], "b", increment);
    var getterSettersByProperty = createGetterSetters();

    assignNodes(reactiveGraph, reactiveFunction, getterSettersByProperty);
    reactiveGraph.addReactiveFunction(reactiveFunction);

    var inNode = reactiveFunction.inNodes[0];
    var outNode = reactiveFunction.outNode;

    assert.equal(reactiveGraph.adjacent(inNode).length, 1);
    assert.equal(reactiveGraph.adjacent(inNode)[0], reactiveFunction.node);

    assert.equal(reactiveGraph.adjacent(reactiveFunction.node).length, 1);
    assert.equal(reactiveGraph.adjacent(reactiveFunction.node)[0], outNode);
  });

  it("should set computed values on digest", function (){
    var reactiveGraph = new ReactiveGraph();
    var reactiveFunction = new ReactiveFunction(["a"], "b", increment);
    var getterSettersByProperty = createGetterSetters();

    assignNodes(reactiveGraph, reactiveFunction, getterSettersByProperty);
    reactiveGraph.addReactiveFunction(reactiveFunction);

    var inNode = reactiveFunction.inNodes[0];
    reactiveGraph.propertyNodeDidChange(inNode);

    reactiveGraph.digest();

    // Assert that b = a + 1, where a = 3
    var b = getterSettersByProperty.b();
    assert.equal(b, 4);
  });
});
