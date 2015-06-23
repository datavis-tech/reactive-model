'use strict';

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
  //function removeEdge(u, v){
  //  if(edges[u]) {
  //    edges[u] = edges[u]
  //  }
  //  adjacent(u).push(v);
  //}

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
    //removeEdge: removeEdge,
    DFS: DFS
  };
}

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

var reactiveGraph = new ReactiveGraph();

var addReactiveFunction      = reactiveGraph.addReactiveFunction;
var makePropertyNode         = reactiveGraph.makePropertyNode;
var makeReactiveFunctionNode = reactiveGraph.makeReactiveFunctionNode;
var propertyNodeDidChange    = reactiveGraph.propertyNodeDidChange;


// This file serves to document the reactive function data structure,
// and contains a utility function for parsing the options passed to model.react().
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

// This function parses the options object passed into `model.react(options)`,
// transforming it into an array of ReactiveFunction instances.
ReactiveFunction.parse = function (options){
  return Object.keys(options).map(function (outProperty){
    var array = options[outProperty];
    var callback = array.splice(array.length - 1)[0];
    var inProperties = array;
    return ReactiveFunction(inProperties, outProperty, callback);
  });
};

function ReactiveModel(){
  
  // Enforce use of new, so instanceof and typeof checks will always work.
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  // Refer to `this` (the ReactiveModel instance) as `model` in this closure.
  var model = this;

  // { property -> defaultValue }
  var publicProperties = {};

  // { property -> value }
  var values = {};

  // { property -> node }
  var trackedProperties = {};

  var isFinalized = false;

  function addPublicProperty(property, defaultValue){
    if(isFinalized){
      throw new Error("model.addPublicProperty() is being " +
        "invoked after model.finalize, but this is not allowed. "+
        "Public properties may only be added before the model is finalized.");
    }

    publicProperties[property] = defaultValue;

    return model;
  }

  function getDefaultValue(property){
    return publicProperties[property];
  }

  function finalize(){
    if(isFinalized){
      throw new Error("model.finalize() is being invoked " +
        "more than once, but this function should only be invoked once.");
    }
    isFinalized = true;

    Object.keys(publicProperties).forEach(function(property){
      track(property);
      model[property](getDefaultValue(property));
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

  function react(options){
    var reactiveFunctions = ReactiveFunction.parse(options);
    reactiveFunctions.forEach(function (reactiveFunction){
      assignNodes(reactiveFunction);
      addReactiveFunction(reactiveFunction);
    });
  }

  function track(property){
    if(property in trackedProperties){
      return trackedProperties[property];
    } else {
      var getterSetter = createGetterSetter(property);

      model[property] = getterSetter;

      var propertyNode = makePropertyNode(getterSetter);
      trackedProperties[property] = propertyNode;

      return propertyNode;
    }
  }

  function createGetterSetter(property){
    return function (value){
      if (!arguments.length) {
        return values[property];
      }
      values[property] = value;
      propertyDidChange(property);
      return model;
    };
  }

  function propertyDidChange(property){
    var propertyNode = trackedProperties[property];
    propertyNodeDidChange(propertyNode);
  }

  function assignNodes(reactiveFunction){
    reactiveFunction.inNodes = reactiveFunction.inProperties.map(track);
    reactiveFunction.node = makeReactiveFunctionNode(reactiveFunction);
    reactiveFunction.outNode = track(reactiveFunction.outProperty);
  }

  model.addPublicProperty = addPublicProperty;
  model.finalize = finalize;
  model.getState = getState;
  model.setState = setState;
  model.react = react;
}

ReactiveModel.digest = reactiveGraph.digest;

// Export these internal modules for unit testing via Rollup CommonJS build.
ReactiveModel.Graph = Graph;
ReactiveModel.ReactiveGraph = ReactiveGraph;
ReactiveModel.ReactiveFunction = ReactiveFunction;

var reactiveModel = ReactiveModel;

module.exports = reactiveModel;