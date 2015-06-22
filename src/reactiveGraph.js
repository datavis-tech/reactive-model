import Graph from "./graph";

function ReactiveGraph(){
  var reactiveGraph = new Graph();
  var nodeCounter = 0;

  // { node -> getterSetter }
  var getterSetters = {};

  // { node -> true }
  var changedPropertyNodes = {};

  function makeNode(){
    return nodeCounter++;
  }

  function assignNodes(reactiveFunction, getterSettersByProperty){

    function makePropertyNode(property){
      var node = makeNode();
      getterSetters[node] = getterSettersByProperty[property];
      return node;
    }

    reactiveFunction.inNodes = reactiveFunction.inProperties.map(makePropertyNode);
    reactiveFunction.node = makeNode();
    reactiveFunction.outNode = makePropertyNode(reactiveFunction.outProperty);
  }

  function addReactiveFunction(reactiveFunction){
    if( (reactiveFunction.inNodes === undefined) ||
        (reactiveFunction.outNode === undefined)){
        throw new Error("Attempting to add a reactive function that " +
          "doesn't have inNodes or outNode defined first.");
    }

    reactiveFunction.inNodes.forEach(function (inNode){
      reactiveGraph.addEdge(inNode, reactiveFunction.node);
    });

    reactiveGraph.addEdge(reactiveFunction.node, reactiveFunction.outNode);

    //reactiveFunction.inNodes.forEach(function (inNode){
    //  if(isDefined(getterSetters[inNode]))
    //    changedNodes
  }

  function isDefined(value){
    return typeof d === "undefined" || d === null;
  }

  function digest(){
    var sourceNodes = Object.keys(changedPropertyNodes);

    sourceNodes.forEach(function (node){
      delete changedPropertyNodes[node];
    });
  }

  reactiveGraph.addReactiveFunction = addReactiveFunction;
  reactiveGraph.assignNodes = assignNodes;
  reactiveGraph.makeNode = makeNode;
  reactiveGraph.digest = digest;

  // This is exposed for unit testing only.
  reactiveGraph.changedPropertyNodes = changedPropertyNodes;

  return reactiveGraph;
}

export default ReactiveGraph;
