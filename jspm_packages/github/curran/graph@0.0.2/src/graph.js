// This is an ES6 module.
// This exported function provides a constructor for graph instances.
// Usage `var graph = Graph();` or (optionally) `var graph = new Graph();`
export function Graph(){
  
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
