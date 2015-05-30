# graph.js

A graph data structure implementation with depth first search. Nodes are identified by strings, and edges are stored internally using an adjacency list representation (the `edges` variable in the `Graph` constructor function closure).

## Usage

```javascript
// Create an empty graph with no nodes or edges.
var graph = Graph();

// Add edges. Nodes are added implicitly.
graph.addEdge("A", "B");
graph.addEdge("B", "C");

// graph.adjacent(nodeId) returns an array of adjacent nodes.
// For each node in 
// prints ["B"]
var adjacentNodes = graph.adjacent("A");
console.log();

// Perform Depth First Search (DFS) starting at node A.
// nodes = ["C", "B", "A"]
var nodes = graph.DFS(["A"]);

var topologicallySorted = nodes.reverse();
```

## Development

```bash
# install dependencies
npm install

# run unit tests
make test

# build UMD module and minified distribution
make
```

The choice of build tools for this project is inspired by [d3-selection](https://github.com/d3/d3-selection). The main difference is that this is using [Mocha](http://mochajs.org/) for testing. I found that Mocha has a better debugging experience than [Tape](https://npmjs.org/package/tape), which is used by d3-selection. This is because Tape spits out the TAP protocol to stdout, so `console.log` messages need to produce TAP statemets like `# everything is fine` in order to show up in the [faucet](https://www.npmjs.com/package/faucet) output, so you cannot use nice Node.js things like `console.log(array)` or `console.log(object)` within tape, whereas these things work when using Mocha.

Curran Kelleher May 2015
