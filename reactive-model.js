'use strict';

function ReactiveModel(){

  // Enforce use of new.
  // See http://stackoverflow.com/questions/17032749/pattern-for-enforcing-new-in-javascript
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  // Refer to `this` (the ReactiveModel instance) as `model` in this closure.
  var model = this;

  return model;
}


// Constructor function for a directed graph data structure.
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


// A simple requestAnimationFrame polyfill.
//
// Inspired by:
//
//   https://github.com/chrisdickinson/raf
//   http://jsmodules.io/
//
// Curran Kelleher June 2015
var nextFrame;
if(typeof requestAnimationFrame === "undefined"){
  nextFrame = setTimeout;
} else {
  nextFrame = requestAnimationFrame;
}
var _nextFrame = nextFrame;

ReactiveModel.Graph = Graph;
ReactiveModel.nextFrame = _nextFrame;

var reactiveModel = ReactiveModel;

module.exports = reactiveModel;