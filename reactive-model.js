'use strict';

function ReactiveModel(){

  // Enforce use of new.
  // See http://stackoverflow.com/questions/17032749/pattern-for-enforcing-new-in-javascript
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }
  var model = this;

  return model;
}

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