var Graph = require("../reactive-model.js").Graph;
var assert = require("assert");
require("source-map-support").install();

describe("Graph", function (){

  it("should be a function", function (){
    assert.equal(typeof Graph, "function");
  });

  it("should add an edge and check adjacency", function (){
    var graph = Graph();
    graph.addEdge("A", "B");
    assert(graph.adjacent("A")[0] === "B");
  });

  it("should perform DFS on a single edge", function (){

    var graph = Graph();
    graph.addEdge("A", "B");

    var nodes = graph.DFS(["A"]);
    assert(nodes[0] === "B");
    assert(nodes[1] === "A");

  });

  it("should perform DFS on a two serial edges", function (){

    var graph = Graph();
    graph.addEdge("A", "B");
    graph.addEdge("B", "C");

    var nodes = graph.DFS(["A"]);
    assert(nodes[0] === "C");
    assert(nodes[1] === "B");
    assert(nodes[2] === "A");

  });

});
