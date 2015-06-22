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

  it("should assign nodes", function (){
    var reactiveGraph = new ReactiveGraph();
    var reactiveFunction = new ReactiveFunction(["a"], "b", increment);
    var getterSettersByProperty = createGetterSetters();

    reactiveGraph.assignNodes(reactiveFunction, getterSettersByProperty);

    assert.equal(reactiveFunction.inNodes.length, 1);
    assert.equal(reactiveFunction.inNodes[0], 0);
    assert.equal(reactiveFunction.node, 1);
    assert.equal(reactiveFunction.outNode, 2);
  });

  it("should add edges to the dependency graph", function (){
    var reactiveGraph = new ReactiveGraph();
    var reactiveFunction = new ReactiveFunction(["a"], "b", increment);
    var getterSettersByProperty = createGetterSetters();

    reactiveGraph.assignNodes(reactiveFunction, getterSettersByProperty);

    reactiveGraph.addReactiveFunction(reactiveFunction);

    var inNode = reactiveFunction.inNodes[0];
    var outNode = reactiveFunction.outNode;

    assert.equal(reactiveGraph.adjacent(inNode).length, 1);
    assert.equal(reactiveGraph.adjacent(inNode)[0], reactiveFunction.node);

    assert.equal(reactiveGraph.adjacent(reactiveFunction.node).length, 1);
    assert.equal(reactiveGraph.adjacent(reactiveFunction.node)[0], outNode);
  });

  it("should clear changed property nodes on digest", function (){
    var reactiveGraph = new ReactiveGraph();
    var reactiveFunction = new ReactiveFunction(["a"], "b", increment);
    var getterSettersByProperty = createGetterSetters();

    reactiveGraph.assignNodes(reactiveFunction, getterSettersByProperty);
    reactiveGraph.addReactiveFunction(reactiveFunction);

    var inNode = reactiveFunction.inNodes[0];
    reactiveGraph.changedPropertyNodes[inNode] = true;

    assert.equal(inNode in reactiveGraph.changedPropertyNodes, true);

    reactiveGraph.digest();

    assert.equal(inNode in reactiveGraph.changedPropertyNodes, false);

    //reactiveGraph.changedPropertyNodes[inNode] = true;

    //// Assert that b = a + 1, where a = 3
    //var b = getterSettersByProperty.b();
    //assert.equal(b, 4);

  });

  //it("should digest", function (){
  //  var reactiveGraph = new ReactiveGraph();
  //  var reactiveFunction = new ReactiveFunction(["a"], "b", increment);
  //  var getterSettersByProperty = createGetterSetters();

  //  reactiveGraph.assignNodes(reactiveFunction, getterSettersByProperty);

  //  reactiveGraph.addReactiveFunction(reactiveFunction);

  //  reactiveGraph.digest();

  //  // Assert that b = a + 1, where a = 3
  //  var b = getterSettersByProperty.b();
  //  assert.equal(b, 4);

  //});

});
