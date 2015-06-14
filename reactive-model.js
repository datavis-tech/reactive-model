'use strict';

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

    // inNodes and outNodes are populated in the function assignNodes(),
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

function invoke(callback){
  callback();
}

function SimpleModel(){

  var values = {};
  var listeners = {};

  function getListeners(property){
    return listeners[property] || (listeners[property] = []);
  }

  function on(property, callback){
    getListeners(property).push(callback);
  }

  // TODO off(property, callback)

  function set(property, value){
    setSilently(property, value);
    getListeners(property).forEach(invoke);
  }

  function setSilently(property, value){
    values[property] = value;
  }

  function get(property){
    return values[property];
  }

  return {
    on: on,
    set: set,
    setSilently: setSilently,
    get: get
  };
}

function ReactiveModel(){

  var simpleModel = SimpleModel();

  // Enforce use of new.
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }
  var model = this;

  // { property -> true }
  var trackedProperties = {};

  function react(options){

    // This parses options and generates an array of reactive functions,
    // each of which has the properties `inProperties` and `outProperties` populated.
    var reactiveFunctions = ReactiveFunction.parse(options);

    // Track in and out properties.
    reactiveFunctions.forEach(function (reactiveFunction){
      reactiveFunction.inProperties.forEach(track);
      track(reactiveFunction.outProperty);
    });

    return reactiveFunctions;
  };

  function track(property){
    if(!(property in trackedProperties)){
      trackedProperties[property] = true;

      model[property] = function(value){
        if (!arguments.length) return simpleModel.get(property);
        simpleModel.set(property, value);
        return model;
      };
    }
  }

  model.react = react;

  return model;
}

function Graph(){
  
  // The adjacency list of the graph.
  // Keys are node ids.
  // Values are adjacent node arrays.
  var edges = {};
  
  // Gets or creates the adjacent node list for node u.
  function adjacent(u){
    return edges[u] || (edges[u] = []);
  }
  
  return {

    adjacent: adjacent,

    addEdge: function (u, v){
      adjacent(u).push(v);
    },

    // TODO test this function
    removeEdge: function (u, v){
      if(edges[u]) {
        edges[u] =  edges[u]
      }
      adjacent(u).push(v);
    },

    // Depth First Search algorithm, inspired by
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
    DFS: function (sourceNodes, shouldVisit){

      var visited = {};
      var nodes = [];

      if(!shouldVisit){
        shouldVisit = function () { return true; };
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
  };
}


// These internals modules are exposed like this for unit testing.
ReactiveModel.SimpleModel = SimpleModel;
ReactiveModel.Graph = Graph;

var reactiveModel = ReactiveModel;

module.exports = reactiveModel;