(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Constructor function for a directed graph data structure.
// Usage `var graph = Graph();` or (optionally) `var graph = new Graph();`
exports = function Graph(){
  
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
var Graph = require("./graph");

// This is the singleton dependency graph
// shared by all instances of ReactiveModel.
var dependencyGraph = new Graph();

exports = function ReactiveModel(){
}

//function ReactiveFunction(inProperties, outProperty, callback){
//  return {
//    inProperties: inProperties, // [String]
//    outProperty: outProperty,   // String
//    callback: callback          // function (...inProperties) -> outPropertyValue
//  };
//}
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

},{"./graph":1}]},{},[2]);
