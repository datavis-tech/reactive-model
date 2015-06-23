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

  // { node -> reactiveFunction }
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

  function makeReactiveFunctionNode(reactiveFunction){
    var node = makeNode();
    reactiveFunctions[node] = reactiveFunction;
    return node;
  }

  function addReactiveFunction(reactiveFunction){

    if( (reactiveFunction.inNodes === undefined) || (reactiveFunction.outNode === undefined) ){
        throw new Error("Attempting to add a reactive function that " +
          "doesn't have inNodes or outNode defined first.");
    }

    reactiveFunction.inNodes.forEach(function (inNode){
      reactiveGraph.addEdge(inNode, reactiveFunction.node);
    });

    reactiveGraph.addEdge(reactiveFunction.node, reactiveFunction.outNode);
  }

  //function isDefined(value){
  //  return typeof d === "undefined" || d === null;
  //}

  function evaluate(reactiveFunction){

    var inValues = reactiveFunction.inNodes.map(function (node){
      return getterSetters[node]();
    });

    var outValue = reactiveFunction.callback.apply(null, inValues);

    getterSetters[reactiveFunction.outNode](outValue);

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

    sourceNodes.forEach(function (node){
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
