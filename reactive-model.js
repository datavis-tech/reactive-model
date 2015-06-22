'use strict';

function ReactiveModel(){
  
  // Enforce use of new, so instanceof and typeof checks will work.
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  // Refer to `this` (the ReactiveModel instance) as `model` in this closure.
  var model = this;

  // { property -> defaultValue }
  var publicProperties = {};

  var isFinalized = false;

  var values = {};

  function addPublicProperty(property, defaultValue){
    if(isFinalized){
      throw new Error("model.addPublicProperty() is being invoked after model.finalize, but this is not allowed. Public properties may only be added before the model is finalized.");
    }

    publicProperties[property] = defaultValue;
    values[property] = defaultValue;

    return model;
  }

  function finalize(){
    if(isFinalized){
      throw new Error("model.finalize() is being invoked more than once, but this function should only be invoked once.");
    }
    isFinalized = true;

    Object.keys(publicProperties).forEach(function (property){
      model[property] = function (value){
        if (!arguments.length) {
          return values[property];
        }
        values[property] = value;
        return model;
      };
    });

    return model;
  }

  function getState(){
    var state = {};
    Object.keys(publicProperties).forEach( function (publicProperty){
      state[publicProperty] = values[publicProperty];
    });
    return state;
  }

  function setState(state){

    // Reset state to default values.
    Object.keys(publicProperties).forEach(function (property){
      var defaultValue = publicProperties[property];
      model[property](defaultValue);
    });

    // Apply values included in the new state.
    Object.keys(state).forEach(function (property){
      var newValue = state[property]
      model[property](newValue);
    });

    return model;
  }

  model.addPublicProperty = addPublicProperty;
  model.finalize = finalize;
  model.getState = getState;
  model.setState = setState;
}


// A graph data structure with depth-first search.
function Graph(){
  
  // The adjacency list of the graph.
  // Keys are node ids.
  // Values are adjacent node id arrays.
  var edges = {};

  // Gets or creates the adjacent node list for node u.
  function adjacent(u){
    return edges[u] || (edges[u] = []);
  }

  function addEdge(u, v){
    adjacent(u).push(v);
  }

  // TODO test this function
  function removeEdge(u, v){
    if(edges[u]) {
      edges[u] = edges[u]
    }
    adjacent(u).push(v);
  }

  // Depth First Search algorithm, inspired by
  // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
  function DFS(sourceNodes, shouldVisit){

    var visited = {};
    var nodes = [];

    if(!shouldVisit){
      shouldVisit = function (node) { return true; };
    }

    sourceNodes.forEach(function DFSVisit(node){
      if(!visited[node] && shouldVisit(node)){
        visited[node] = true;
        adjacent(node).forEach(DFSVisit);
        nodes.push(node);
      }
    });

    return nodes;
  }
  
  return {
    adjacent: adjacent,
    addEdge: addEdge,
    removeEdge: removeEdge,
    DFS: DFS
  };
}

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


function ReactiveFunction(inProperties, outProperty, callback){
  return {

    // An array of input property names.
    inProperties: inProperties,

    // The output property name.
    outProperty: outProperty,

    // function (inPropertyValues) -> outPropertyValue
    // Invoked during a digest,
    //   - when all input property values are first defined,
    //   - in response to any changes in input property values.
    callback: callback,

    // inNodes and outNodes are populated in the function reactiveModel.assignNodes(),
    // which is invoked after the original ReactiveFunction object is created.

    // An array of node id strings corresponding
    // to the property names in inProperties.
    inNodes: undefined,

    // The node id string corresponding to the output property.
    outNode: undefined
  };
}

// This is where the options object passed into `model.react(options)` gets
// transformed into an array of ReactiveFunction instances.
ReactiveFunction.parse = function (options){
  return Object.keys(options).map( function (outProperty){
    var arr = options[outProperty];
    var callback = arr.splice(arr.length - 1)[0];
    var inProperties = arr;
    return ReactiveFunction(inProperties, outProperty, callback);
  });
};


// Export these internal modules for unit testing via Rollup CommonJS build.
ReactiveModel.Graph = Graph;
ReactiveModel.ReactiveGraph = ReactiveGraph;
ReactiveModel.ReactiveFunction = ReactiveFunction;

var reactiveModel = ReactiveModel;

module.exports = reactiveModel;