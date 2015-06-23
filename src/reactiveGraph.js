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

  function evaluate(reactiveFunction){
    var inValues = reactiveFunction.inNodes.map(getPropertyNodeValue);
    var outValue = reactiveFunction.callback.apply(null, inValues);
    getterSetters[reactiveFunction.outNode](outValue);
  }

  function getPropertyNodeValue(node){
    return getterSetters[node]();
  }

  function digest(){
  
    var sourceNodes = Object.keys(changedPropertyNodes);
    var visitedNodes = reactiveGraph.DFS(sourceNodes, shouldVisit);
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

  function shouldVisit(node){

    // Only visit reactive function whose inputs are all defined.
    if(node in reactiveFunctions){
      var reactiveFunction = reactiveFunctions[node];
      var willVisit = reactiveFunction.inNodes.every(function (node){
        var defined = isDefined(getPropertyNodeValue(node));

        // TODO test this, required for multiple hops
        //var changed = node in changedPropertyNodes;
        return defined; //|| changed;
      });

      // TODO test this, required for multiple hops
      //if(willVisit){
      //  propertyNodeDidChange(reactiveFunction.outNode);
      //}
      return willVisit;
    } else {
     
      // Visit all property nodes regardless.
      return true;
    }
  }

  function isDefined(value){
    return !(typeof value === "undefined" || value === null);
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
