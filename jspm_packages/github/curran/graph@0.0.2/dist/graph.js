/* */ 
"format es6";
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(["exports"], factory) :
  factory((global.Graph = {}))
}(this, function (exports) { 'use strict';

  exports.Graph = Graph;

  // This is an ES6 module.
  function Graph(){
    
    // Keys are node ids.
    // Values are arrays of adjacent node ids.
    var edges = {};
    
    // Gets or creates the adjavent node list for node u.
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
      DFS: function (originNodes){

        var visited = {};
        var nodes = [];

        originNodes.forEach(function DFSVisit(u){
          if(!visited[u]){
            visited[u] = true;
            adjacent(u).forEach(DFSVisit);
            nodes.push(u);
          }
        });

        return nodes;
      }
    };
  }

}));