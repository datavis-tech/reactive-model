'use strict';

function ReactiveModel(){
  
  // Enforce use of new, so instanceof and typeof checks will work.
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  // Refer to `this` (the ReactiveModel instance) as `model` in this closure.
  var model = this;
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


// Export graph for unit testing.
ReactiveModel.Graph = Graph;

var reactiveModel = ReactiveModel;

module.exports = reactiveModel;