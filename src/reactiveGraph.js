import Graph from "./graph";

function ReactiveGraph(){
  var reactiveGraph = new Graph();
  var nodeCounter = 0;

  // { node -> getterSetter }
  var getterSetters = {};

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


    //reactiveFunction.inProperties.forEach(function (property){
    //  var inNode = getPropertyNode(inProperty);
    //  dependencyGraph.addEdge(inNode, reactiveFunction.node);
    //});

  }

  function digest(){
  }

  reactiveGraph.addReactiveFunction = addReactiveFunction;
  reactiveGraph.assignNodes = assignNodes;
  reactiveGraph.makeNode = makeNode;

  return reactiveGraph;
}


export default ReactiveGraph;
