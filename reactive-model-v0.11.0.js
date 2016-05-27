(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ReactiveModel = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// By Curran Kelleher April 2016

var ReactiveFunction = require("reactive-function");
var ReactiveProperty = require("reactive-property");

// Functional utility for invoking methods on collections.
function invoke(method){
  return function(d){
    return d[method]();
  };
}

// The constructor for reactive models.
// This function is exported as the public API of this module.
function ReactiveModel(){

  // An array of property names for exposed properties.
  var exposedProperties;

  // This is a string, the name of the last property added.
  // This is used in `expose()`;
  var lastPropertyAdded;

  // The configuration of the model is represented as an object and stored
  // in this reactive property. Note that only values for exposed properties
  // whose values differ from their defaults are included in the configuration object.
  // The purpose of the configuration accessor API is serialization and deserialization,
  // so default values are left out for a concise serialized form.
  var configurationProperty = ReactiveProperty();
  configurationProperty.propertyName = "configuration";

  // This is a reactive function set up to listen for changes in all
  // exposed properties and set the configurationProperty value.
  var configurationReactiveFunction;

  // An array of reactive functions that have been set up on this model.
  // These are tracked only so they can be destroyed in model.destroy().
  var reactiveFunctions = [];

  // The model instance object.
  // This is the value returned from the constructor.
  var model = function (){
    var outputPropertyName, callback, inputPropertyNames

    if(arguments.length === 0){
      return configurationProperty();
    } else if(arguments.length === 1){
      if(typeof arguments[0] === "object"){

        // The invocation is of the form model(configuration)
        return setConfiguration(arguments[0]);
      } else {

        // The invocation is of the form model(propertyName)
        return addProperty(arguments[0]);
      }
    } else if(arguments.length === 2){
      if(typeof arguments[0] === "function"){

        // The invocation is of the form model(callback, inputPropertyNames)
        inputPropertyNames = arguments[1];
        callback = arguments[0];
        outputPropertyName = undefined;
      } else {

        // The invocation is of the form model(propertyName, defaultValue)
        return addProperty(arguments[0], arguments[1]);
      }
    } else if(arguments.length === 3){
      outputPropertyName = arguments[0];
      callback = arguments[1];
      inputPropertyNames = arguments[2];
    }

    // inputPropertyNames may be a string of comma-separated property names,
    // or an array of property names.
    if(typeof inputPropertyNames === "string"){
      inputPropertyNames = inputPropertyNames.split(",").map(invoke("trim"));
    }

    // TODO throw an error if a property is not on the model.
    var inputs = inputPropertyNames.map(getProperty);

    // Create a new reactive property for the output and assign it to the model.
    // TODO throw an error if the output property is already defined on the model.
    if(outputPropertyName){
      var output = ReactiveProperty();
      output.propertyName = outputPropertyName;
      model[outputPropertyName] = output;
    }

    // If the number of arguments expected by the callback is one greater than the
    // number of inputs, then the last argument is the "done" callback, and this
    // reactive function will be set up to be asynchronous. The "done" callback should
    // be called with the new value of the output property asynchronously.
    var isAsynchronous = (callback.length === inputs.length + 1);
    if(isAsynchronous){
      reactiveFunctions.push(ReactiveFunction({
        inputs: inputs,
        callback: function (){

          // Convert the arguments passed into this function into an array.
          var args = Array.prototype.slice.call(arguments);

          // Push the "done" callback onto the args array.
          // We are actally passing the output reactive property here, invoking it
          // as the "done" callback will set the value of the output property.
          args.push(output);

          // Wrap in setTimeout to guarantee that the output property is set
          // asynchronously, outside of the current digest. This is necessary
          // to ensure that if developers inadvertently invoke the "done" callback 
          // synchronously, their code will still have the expected behavior.
          setTimeout(function (){

            // Invoke the original callback with the args array as arguments.
            callback.apply(null, args);
          });
        }
      }));
    } else {
      reactiveFunctions.push(ReactiveFunction({
        inputs: inputs,
        output: output, // This may be undefined.
        callback: callback
      }));
    }
    return model;
  };

  // Gets a reactive property from the model by name.
  // Convenient for functional patterns like `propertyNames.map(getProperty)`
  function getProperty(propertyName){
    return model[propertyName];
  }

  // Adds a property to the model that is not exposed,
  // meaning that it is not included in the configuration object.
  function addProperty(propertyName, defaultValue){
    var property = ReactiveProperty(defaultValue);
    property.propertyName = propertyName;
    model[propertyName] = property;
    lastPropertyAdded = propertyName;
    return model;

    // TODO throw an error if the name is not available (e.g. another property name, "configuration" or "addPublicProperty").
  }

  // Exposes the last added property to the configuration.
  function expose(){

    // TODO test this
    // if(!isDefined(defaultValue)){
    //  throw new Error("model.addPublicProperty() is being " +
    //    "invoked with an undefined default value. Default values for exposed properties " +
    //    "must be defined, to guarantee predictable behavior. For exposed properties that " +
    //    "are optional and should have the semantics of an undefined value, " +
    //    "use null as the default value.");
    //}

    // TODO test this
    if(!lastPropertyAdded){
      throw Error("Expose() was called without first adding a property.");
    }

    var propertyName = lastPropertyAdded;

    if(!exposedProperties){
      exposedProperties = [];
    }
    exposedProperties.push(propertyName);

    // Destroy the previous reactive function that was listening for changes
    // in all exposed properties except the newly added one.
    // TODO think about how this might be done only once, at the same time isFinalized is set.
    if(configurationReactiveFunction){
      configurationReactiveFunction.destroy();
    }

    // Set up the new reactive function that will listen for changes
    // in all exposed properties including the newly added one.
    var inputPropertyNames = exposedProperties;

    //console.log(inputPropertyNames);
    configurationReactiveFunction = ReactiveFunction({
      inputs: inputPropertyNames.map(getProperty),
      output: configurationProperty,
      callback: function (){
        var configuration = {};
        inputPropertyNames.forEach(function (propertyName){
          var property = getProperty(propertyName);

          // Omit default values from the returned configuration object.
          if(property() !== property.default()){
            configuration[propertyName] = property();
          }
        });
        return configuration;
      }
    });

    // Support method chaining.
    return model;
  }

  function setConfiguration(newConfiguration){

    exposedProperties.forEach(function (propertyName){
      var property = getProperty(propertyName);
      var oldValue = property();
      var newValue;

      if(propertyName in newConfiguration){
        newValue = newConfiguration[propertyName];
      } else {
        newValue = property.default();
      }

      if(oldValue !== newValue){
        model[propertyName](newValue);
      }
    });

    return model;
  }

  // Destroys all reactive functions that have been added to the model.
  function destroy(){
    reactiveFunctions.forEach(invoke("destroy"));

    if(configurationReactiveFunction){
      configurationReactiveFunction.destroy();
    }

    // TODO destroy all properties on the model, remove their listeners and nodes in the graph.

    // TODO test bind case
  }

  function call (fn){
    var args = Array.prototype.slice.call(arguments);
    args[0] = model;
    fn.apply(null, args);
    return model;
  };

  model.expose = expose;
  model.destroy = destroy;
  model.call = call;
  model.on = function (callback){
  
    // Ensure the callback is invoked asynchronously,
    // so that property values can be set inside it.
    return configurationProperty.on(function (newConfiguration){
      setTimeout(function (){
        callback(newConfiguration);
      }, 0);
    });
  };

  model.off = configurationProperty.off;

  return model;
}

// Expose static functions from ReactiveFunction.
ReactiveModel.digest         = ReactiveFunction.digest;
ReactiveModel.serializeGraph = ReactiveFunction.serializeGraph;
ReactiveModel.link           = ReactiveFunction.link;

//ReactiveModel.nextFrame = ReactiveFunction.nextFrame;

module.exports = ReactiveModel;

},{"reactive-function":3,"reactive-property":4}],2:[function(require,module,exports){
// A graph data structure with depth-first search and topological sort.
module.exports = function Graph(serialized){

  // The returned graph instance.
  var graph = {
    addNode: addNode,
    removeNode: removeNode,
    nodes: nodes,
    adjacent: adjacent,
    addEdge: addEdge,
    removeEdge: removeEdge,
    indegree: indegree,
    outdegree: outdegree,
    depthFirstSearch: depthFirstSearch,
    topologicalSort: topologicalSort,
    serialize: serialize,
    deserialize: deserialize
  };

  // The adjacency list of the graph.
  // Keys are node ids.
  // Values are adjacent node id arrays.
  var edges = {};

  // If a serialized graph was passed into the constructor, deserialize it.
  if(serialized){
    deserialize(serialized);
  }

  // Adds a node to the graph.
  // If node was already added, this function does nothing.
  // If node was not already added, this function sets up an empty adjacency list.
  function addNode(node){
    edges[node] = adjacent(node);
    return graph;
  }

  // Removes a node from the graph.
  // Also removes incoming and outgoing edges.
  function removeNode(node){
    
    // Remove incoming edges.
    Object.keys(edges).forEach(function (u){
      edges[u].forEach(function (v){
        if(v === node){
          removeEdge(u, v);
        }
      });
    });

    // Remove outgoing edges (and signal that the node no longer exists).
    delete edges[node];

    return graph;
  }

  // Gets the list of nodes that have been added to the graph.
  function nodes(){
    var nodeSet = {};
    Object.keys(edges).forEach(function (u){
      nodeSet[u] = true;
      edges[u].forEach(function (v){
        nodeSet[v] = true;
      });
    });
    return Object.keys(nodeSet);
  }

  // Gets the adjacent node list for the given node.
  // Returns an empty array for unknown nodes.
  function adjacent(node){
    return edges[node] || [];
  }

  // Adds an edge from node u to node v.
  // Implicitly adds the nodes if they were not already added.
  function addEdge(u, v){
    addNode(u);
    addNode(v);
    adjacent(u).push(v);
    return graph;
  }

  // Removes the edge from node u to node v.
  // Does not remove the nodes.
  // Does nothing if the edge does not exist.
  function removeEdge(u, v){
    if(edges[u]){
      edges[u] = adjacent(u).filter(function (_v){
        return _v !== v;
      });
    }
    return graph;
  }

  // Computes the indegree for the given node.
  // Not very efficient, costs O(E) where E = number of edges.
  function indegree(node){
    var degree = 0;
    function check(v){
      if(v === node){
        degree++;
      }
    }
    Object.keys(edges).forEach(function (u){
      edges[u].forEach(check);
    });
    return degree;
  }

  // Computes the outdegree for the given node.
  function outdegree(node){
    return node in edges ? edges[node].length : 0;
  }

  // Depth First Search algorithm, inspired by
  // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
  // This variant includes an additional option 
  // `includeSourceNodes` to specify whether to include or
  // exclude the source nodes from the result (true by default).
  // If `sourceNodes` is not specified, all nodes in the graph
  // are used as source nodes.
  function depthFirstSearch(sourceNodes, includeSourceNodes){

    if(!sourceNodes){
      sourceNodes = nodes();
    }

    if(typeof includeSourceNodes !== "boolean"){
      includeSourceNodes = true;
    }

    var visited = {};
    var nodeList = [];

    function DFSVisit(node){
      if(!visited[node]){
        visited[node] = true;
        adjacent(node).forEach(DFSVisit);
        nodeList.push(node);
      }
    }

    if(includeSourceNodes){
      sourceNodes.forEach(DFSVisit);
    } else {
      sourceNodes.forEach(function (node){
        visited[node] = true;
      });
      sourceNodes.forEach(function (node){
        adjacent(node).forEach(DFSVisit);
      });
    }

    return nodeList;
  }

  // The topological sort algorithm yields a list of visited nodes
  // such that for each visited edge (u, v), u comes before v in the list.
  // Amazingly, this comes from just reversing the result from depth first search.
  // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 613
  function topologicalSort(sourceNodes, includeSourceNodes){
    return depthFirstSearch(sourceNodes, includeSourceNodes).reverse();
  }

  // Serializes the graph.
  function serialize(){
    var serialized = {
      nodes: nodes().map(function (id){
        return { id: id };
      }),
      links: []
    };

    serialized.nodes.forEach(function (node){
      var source = node.id;
      adjacent(source).forEach(function (target){
        serialized.links.push({
          source: source,
          target: target
        });
      });
    });

    return serialized;
  }

  // Deserializes the given serialized graph.
  function deserialize(serialized){
    serialized.nodes.forEach(function (node){ addNode(node.id); });
    serialized.links.forEach(function (link){ addEdge(link.source, link.target); });
    return graph;
  }
  
  return graph;
}

},{}],3:[function(require,module,exports){
var ReactiveProperty = require("reactive-property");
var Graph = require("graph-data-structure");

// Use requestAnimationFrame if it is available.
// Otherwise fall back to setTimeout.
var nextFrame = setTimeout;
if(typeof requestAnimationFrame !== 'undefined') {
  nextFrame = requestAnimationFrame;
}

// The singleton data dependency graph.
// Nodes are reactive properties.
// Edges are dependencies between reactive function inputs and outputs.
var graph = Graph();

// A map for looking up properties based on their assigned id.
// Keys are property ids, values are reactive properties.
var properties = {};

// This object accumulates properties that have changed since the last digest.
// Keys are property ids, values are truthy (the object acts like a Set).
var changed = {};

// Assigns an id to a reactive property so it can be a node in the graph.
// Also stores a reference to the property by id in `properties`.
// If the given property already has an id, does nothing.
var assignId = (function(){
  var counter = 1;
  return function (property){
    if(!property.id){
      property.id = String(counter++);
      properties[property.id] = property;
    }
  };
}());

// The reactive function constructor.
// Accepts an options object with
//  * inputs - An array of reactive properties.
//  * callback - A function with arguments corresponding to values of inputs.
//  * output - A reactive property (optional).
function ReactiveFunction(options){

  var inputs = options.inputs;
  var callback = options.callback;
  var output = options.output;
  
  if(!output){
    output = function (){};
    output.propertyName = "";
  }

  // This gets invoked during a digest, after inputs have been evaluated.
  output.evaluate = function (){

    // Get the values for each of the input reactive properties.
    var values = inputs.map(function (input){
      return input();
    });

    // If all input values are defined,
    if(defined(values)){

      // invoke the callback and assign the output value.
      output(callback.apply(null, values));
    }

  };

  // Assign node ids to inputs and output.
  assignId(output);
  inputs.forEach(assignId);

  // Set up edges in the graph from each input.
  inputs.forEach(function (input){
    graph.addEdge(input.id, output.id);
  });

  // Add change listeners to each input property.
  // These mark the properties as changed and queue the next digest.
  var listeners = inputs.map(function (property){
    return property.on(function (){
      changed[property.id] = true;
      queueDigest();
    });
  });

  // Return an object that can destroy the listeners and edges set up.
  return {

    // This function must be called to explicitly destroy a reactive function.
    // Garbage collection is not enough, as we have added listeners and edges.
    destroy: function (){

      // Remove change listeners from inputs.
      listeners.forEach(function (listener, i){
        inputs[i].off(listener);
      });

      // Remove the edges that were added to the dependency graph.
      inputs.forEach(function (input){
        graph.removeEdge(input.id, output.id);
      });

      // Remove property nodes with no edges connected.
      inputs.concat([output]).forEach(function (property){
        var node = property.id;
        if(graph.indegree(node) + graph.outdegree(node) === 0){
          graph.removeNode(property.id);
        }
      });

      // Remove the reference to the 'evaluate' function.
      delete output.evaluate;

      // Remove references to everything.
      inputs = callback = output = undefined;
    }
  };
}

// Propagates changes through the dependency graph.
ReactiveFunction.digest = function (){
  graph
    .topologicalSort(Object.keys(changed), false)
    .map(function (id){
      return properties[id];
    })
    .forEach(function (property){
      property.evaluate();
    });

  changed = {};
};

// This function queues a digest at the next tick of the event loop.
var queueDigest = debounce(ReactiveFunction.digest);

// Returns a function that, when invoked, schedules the given function
// to execute once on the next frame.
// Similar to http://underscorejs.org/#debounce
function debounce(callback){
  var queued = false;
  return function () {
    if(!queued){
      queued = true;
      nextFrame(function () {
        queued = false;
        callback();
      }, 0);
    }
  };
}

// Returns true if all elements of the given array are defined.
function defined(arr){
  return !arr.some(isUndefined);
}

// Returns true if the given object is undefined.
// Returns false if the given object is some value, including null.
// Inspired by http://ryanmorr.com/exploring-the-eternal-abyss-of-null-and-undefined/
function isUndefined(obj){
  return obj === void 0;
}

ReactiveFunction.nextFrame = nextFrame;

ReactiveFunction.serializeGraph = function (){
  var serialized = graph.serialize();

  // Add property names.
  serialized.nodes.forEach(function (node){
    var propertyName = properties[node.id].propertyName;
    if(typeof propertyName !== "undefined"){
      node.propertyName = propertyName;
    }
  });

  return serialized;
}

ReactiveFunction.link = function (propertyA, propertyB){
  return ReactiveFunction({
    inputs: [propertyA],
    output: propertyB,
    callback: function (x){ return x; }
  });
}

module.exports = ReactiveFunction;

},{"graph-data-structure":2,"reactive-property":4}],4:[function(require,module,exports){
// UMD boilerplate (from Rollup)
(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() :
  typeof define === "function" && define.amd ? define(factory) : (global.ReactiveProperty = factory());
}(this, function () { "use strict";

  // Error messages for exceptions thrown.
  var errors = {
    tooManyArgsConstructor: "ReactiveProperty(value) accepts only a single argument, the initial value.",
    tooManyArgsSetter: "reactiveProperty(newValue) accepts only a single argument, the new value.",
    onNonFunction: "ReactiveProperty.on(listener) only accepts functions, not values.",
    onArgs: "ReactiveProperty.on(listener) accepts exactly one argument, the listener function."
  };

  // This function generates a getter-setter with change listeners.
  return function ReactiveProperty(value){

    // An array of registered listener functions.
    var listeners;
    
    // Check for too many arguments.
    if(arguments.length > 2) {
      throw Error(errors.tooManyArgsConstructor);
    }

    // This is the reactive property function that gets returned.
    function reactiveProperty(newValue){
    
      // Check for too many arguments.
      if(arguments.length > 1) {
        throw Error(errors.tooManyArgsSetter);
      }
      
      // This implements the setter part of the setter-getter.
      if(arguments.length === 1){

        // Grab the old value for passing into the listener.
        var oldValue = value;

        // Track the new value internally.
        value = newValue;

        // Notify registered listeners.
        if(listeners){
          for(var i = 0; i < listeners.length; i++){
            listeners[i](newValue, oldValue);
          }
        }

        // Support method chaining by returning 'this'.
        return this;
      }

      // This implements the getter part of the setter-getter.
      return value;
    }

    // Registers a new listener to receive updates.
    reactiveProperty.on = function (listener){

      // Check for invalid types.
      if(typeof listener !== "function"){
        throw Error(errors.onNonFunction);
      }

      // Check for wrong number of arguments.
      if(arguments.length > 1 || arguments.length === 0){
        throw Error(errors.onArgs);
      }

      // If no listeners have been added yet, initialize the array.
      if(!listeners){
        listeners = [];
      }

      // Register the listener.
      listeners.push(listener);

      // If there is an initial value, invoke the listener immediately.
      // null is considered as a defined value.
      if(value !== void 0){
        listener(value);
      }

      // For convenience, the listener is returned.
      return listener;
    };

    // Unregisters the given listener function.
    reactiveProperty.off = function (listenerToRemove){
      if(listeners){
        listeners = listeners.filter(function (listener){
          return listener !== listenerToRemove;
        });
      }
    };

    // Unregisters all listeners.
    reactiveProperty.destroy = function (){
      listeners = [];
    };

    // Expose the default value
    if(value){
      var defaultValue = value;
      reactiveProperty.default = function (){
        return defaultValue;
      };
    }

    return reactiveProperty;
  };
}));

},{}]},{},[1])(1)
});