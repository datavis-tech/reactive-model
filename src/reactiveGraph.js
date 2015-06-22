import Graph from "./graph";

function ReactiveGraph(){
  var reactiveGraph = new Graph();
  var nodeCounter = 0;

  // { node -> getterSetter }
  var getterSetters = {};

  // { node -> reactiveFunction }
  var reactiveFunctions = {};

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
    
    function makeReactiveFunctionNode(reactiveFunction){
      var node = makeNode();
      reactiveFunctions[node] = reactiveFunction;
      return node;
    }

    reactiveFunction.inNodes = reactiveFunction.inProperties.map(makePropertyNode);
    reactiveFunction.node = makeReactiveFunctionNode(reactiveFunction);
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


  // Constructs the object to be passed into reactive function callbacks.
  // Returns an object with values for each inProperty of the given reactive function.
  function inPropertyValues(λ){
    var d = {};
    reactiveFunction.inProperties.forEach(function (inProperty){
      d[inProperty] = simpleModel.get(inProperty);
    });
    return d;
  }

  function evaluate(reactiveFunction){
    var inValues = reactiveFunction.inNodes.map(function (node){
      return getterSetters[node]();
    });
    var outValue = reactiveFunction.callback.apply(null, inValues);
    getterSetters[reactiveFunction.outNode](outValue);
  }

  function digest(){
    var sourceNodes = Object.keys(changedPropertyNodes);
    var topologicallySorted = reactiveGraph.DFS(sourceNodes).reverse();

    topologicallySorted.forEach(function (node){
      if(node in reactiveFunctions){
        evaluate(reactiveFunctions[node]);
      }
    });

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
