// A graph data structure that represents a data dependency graph.
// Nodes represent properties of reactive models and reactive functions.
// Edges represent reactive dependencies.

// A single instance of ReactiveGraph contains nodes for properties
// from many different instances of ReactiveModel.

import Graph from "./graph";

function ReactiveGraph(){
  var reactiveGraph = new Graph();

  // { node -> getterSetter }
  var getterSetters = {};

  // { node -> λ }
  var reactiveFunctions = {};

  // { node -> true }
  var changedPropertyNodes = {};
  
  var nodeCounter = 0;

  function makeNode(){
    return nodeCounter++;
  }

  function makePropertyNode(getterSetter){
    var node = makeNode();
    getterSetters[node] = getterSetter;
    return node;
  }

  function makeReactiveFunctionNode(λ){
    var node = makeNode();
    reactiveFunctions[node] = λ;
    return node;
  }

  function addReactiveFunction(λ){

    if( (λ.inNodes === undefined) || (λ.outNode === undefined) ){
        throw new Error("Attempting to add a reactive function that " +
          "doesn't have inNodes or outNode defined first.");
    }

    λ.inNodes.forEach(function (inNode){
      reactiveGraph.addEdge(inNode, λ.node);
    });

    reactiveGraph.addEdge(λ.node, λ.outNode);
  }

  function evaluate(λ){
    var inValues = λ.inNodes.map(getPropertyNodeValue);
    if(inValues.every(isDefined)){
      var outValue = λ.callback.apply(null, inValues);
      getterSetters[λ.outNode](outValue);
    }
  }

  function isDefined(value){
    return !(typeof value === "undefined" || value === null);
  }

  function getPropertyNodeValue(node){
    return getterSetters[node]();
  }

  function digest(){
  
    var sourceNodes = Object.keys(changedPropertyNodes);
    var visitedNodes = reactiveGraph.DFS(sourceNodes);
    var topologicallySorted = visitedNodes.reverse();

    topologicallySorted.forEach(function (node){
      if(node in reactiveFunctions){
        evaluate(reactiveFunctions[node]);
      }
    });

    sourceNodes.forEach(function(node){
      delete changedPropertyNodes[node];
    });
  }

  function propertyNodeDidChange(node){
    changedPropertyNodes[node] = true;

    // TODO add this:
    // scheduleDigestOnNextFrame();
  }

  reactiveGraph.addReactiveFunction      = addReactiveFunction;
  reactiveGraph.makeNode                 = makeNode;
  reactiveGraph.digest                   = digest;
  reactiveGraph.makePropertyNode         = makePropertyNode;
  reactiveGraph.makeReactiveFunctionNode = makeReactiveFunctionNode;
  reactiveGraph.propertyNodeDidChange    = propertyNodeDidChange;

  return reactiveGraph;
}

export default ReactiveGraph;
