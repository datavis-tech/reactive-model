(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Constructor function for a directed graph data structure.
module.exports = function Graph(){
  
  // The adjacency list of the graph.
  // Keys are node ids.
  // Values are arrays of adjacent node ids.
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

    // Depth First Search algorithm, inspired by
    // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
    DFS: function (sourceNodes){

      var visited = {};
      var nodes = [];

      sourceNodes.forEach(function DFSVisit(node){
        if(!visited[node]){
          visited[node] = true;
          adjacent(node).forEach(DFSVisit);
          nodes.push(node);
        }
      });

      return nodes;
    }
  };
}

},{}],2:[function(require,module,exports){
// Each reactive function gets a unique id.
// This is so reactive functions can be identified by strings,
// and those strings can be used as node ids in the dependency graph.
// For example, the string "λ45" identifies reactive function with id 45.
var reactiveFunctionIdCounter = 0;

// This function is a factory for objects that represent reactive functions,
// each having input properties, a single output property, and an associated callback.
function ReactiveFunction(inProperties, outProperty, callback){
  return {

    // Each ective function gets a unique id.
    id: reactiveFunctionIdCounter++,

    // An array of property name strings.
    inProperties: inProperties,

    // A single property name string.
    outProperty: outProperty,

    // function (...inProperties) -> outPropertyValue
    // Invoked when all input properties are defined,
    // at most once each animation frame with most recent values,
    // triggered whenever input properties change.
    callback: callback
  };
}

// This is where the options object passed into `model.react(options)` gets
// transformed into an array of ReactiveFunction instances.
ReactiveFunction.parse = function (options){

  var outProperties = Object.keys(options);

  return outProperties.map( function (outProperty){

    var arr = options[outProperty];

    // The first element in the array should be a comma delimited
    // list of input property names.
    var inPropertiesStr = arr[0];
    var inProperties = inPropertiesStr.split(",").map( function (inPropertyStr){
      return inPropertyStr.trim();
    });

    // The second element in the array should be a callback.
    var callback = arr[1]; 

    return ReactiveFunction(inProperties, outProperty, callback);
  });
};

module.exports = ReactiveFunction;

},{}],3:[function(require,module,exports){
module.exports = {
  encodeProperty: function (model, property){
    return model.id + "." + property;
  },
  encodeReactiveFunction: function (reactiveFunction) {
    return "λ" + reactiveFunction.id
  }
};

},{}],4:[function(require,module,exports){
var Graph = require("./graph");
var ReactiveFunction = require("./reactiveFunction");

var stringIdentifiers = require("./stringIdentifiers");
var encodeReactiveFunction = stringIdentifiers.encodeReactiveFunction;
var encodeProperty         = stringIdentifiers.encodeProperty;

// This is the singleton dependency graph
// shared by all instances of ReactiveModel.
var dependencyGraph = new Graph();

// Each model gets a unique id.
// This is so (model, property) pairs can be identified by strings,
// and those strings can be used as node ids in the dependency graph.
// For example, the string "3.foo" identifies the "foo" property of model with id 3.
var modelIdCounter = 0;

function ReactiveModel(){

  // Enforce use of new.
  // See http://stackoverflow.com/questions/17032749/pattern-for-enforcing-new-in-javascript
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  // Refer to `this` (the ReactiveModel instance) as `model`, for code clarity.
  var model = this;

  // Each model gets a unique id.
  model.id = modelIdCounter++;

  model.react = function (options){

    var reactiveFunctions = ReactiveFunction.parse(options);

    reactiveFunctions.forEach(function (λ){

      var λNode = encodeReactiveFunction(λ);
      var outNode = encodeProperty(model, λ.outProperty);

      dependencyGraph.addEdge(λNode, outNode);

      λ.inProperties.forEach(function (inProperty){
        var inNode = encodeProperty(model, inProperty);
        dependencyGraph.addEdge(inNode, λNode);
        //track(inProperty);
      });
    });

    return reactiveFunctions;
  };
}

// Expose internals for unit testing only.
ReactiveModel.dependencyGraph = dependencyGraph;
ReactiveModel.encodeReactiveFunction = encodeReactiveFunction;
ReactiveModel.encodeProperty = encodeProperty;

module.exports = ReactiveModel;

//
//function allAreDefined(arr){
//  return !arr.some(isNotDefined);
//}
//
//function isNotDefined(d){
//  return typeof d === 'undefined' || d === null;
//}
//
//function debounce(callback){
//  var queued = false;
//  return function () {
//    if(!queued){
//      queued = true;
//      setTimeout(function () {
//        queued = false;
//        callback();
//      }, 0);
//    }
//  };
//}
//
//export function ReactiveModel(){
//
//  if (!(this instanceof ReactiveModel)) {
//    return new ReactiveModel();
//  }
//
//  var model = this;
//  var values = {};
//  var trackedProperties = {};
//  var reactiveFunctions = {};
//
//  function getReactiveFunctions(inProperty){
//    if( !(inProperty in reactiveFunctions) ){
//      return reactiveFunctions[inProperty] = [];
//    } else {
//      return reactiveFunctions[inProperty];
//    }
//  }
//
//  var invoke = function(reactiveFunction){
//    var args = reactiveFunction.inProperties.map( function (inProperty){
//      return values[inProperty];
//    });
//    if(allAreDefined(args)){
//      reactiveFunction.callback.apply(null, args);
//    }
//  };
//
//  model.react = function (options){
//    Object.keys(options).forEach( function (outProperty){
//
//      var arr = options[outProperty];
//
//      var inPropertiesStr = arr[0];
//      var callback        = arr[1]; 
//
//      var inProperties = inPropertiesStr.split(",").map( function (inPropertyStr){
//        return inPropertyStr.trim();
//      });
//
//      var reactiveFunction = ReactiveFunction(inProperties, outProperty, callback);
//
//      inProperties.forEach(function (inProperty){
//        getReactiveFunctions(inProperty).push(reactiveFunction);
//        track(inProperty);
//      });
//
//      invoke(reactiveFunction);
//    });
//  };
//
//  function track(property){
//    if( !trackedProperties[property] ){
//      trackedProperties[property] = true;
//
//      var previousValue = model[property];
//
//      Object.defineProperty(model, property, {
//        get: function (){
//          return values[property];
//        },
//        set: function (value){
//          values[property] = value;
//          
//          // TODO test this path
//          //getReactiveFunctions(property).forEach(invoke);
//        }
//      });
//
//      if(!isNotDefined(previousValue)){
//        model[property] = previousValue;
//      }
//    }
//  }
//
//  return model;
//};

},{"./graph":1,"./reactiveFunction":2,"./stringIdentifiers":3}]},{},[4]);
