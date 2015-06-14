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
export default Graph;
