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

  }

  model.addPublicProperty = addPublicProperty;
  model.finalize = finalize;
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


// Export Graph for unit testing via Rollup CommonJS build.
ReactiveModel.Graph = Graph;

var reactiveModel = ReactiveModel;

module.exports = reactiveModel;