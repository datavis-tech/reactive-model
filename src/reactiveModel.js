import Graph from "./graph";
import ReactiveFunction from "./reactiveFunction";

function ReactiveModel(){
  
  // Enforce use of new, so instanceof and typeof checks will work.
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  // Refer to `this` (the ReactiveModel instance) as `model` in this closure.
  var model = this;
}

// Export graph for unit testing.
ReactiveModel.Graph = Graph;

export default ReactiveModel;
