import SimpleModel from "./simpleModel";
import Graph from "./graph";

function ReactiveModel(){

  // Enforce use of new.
  // See http://stackoverflow.com/questions/17032749/pattern-for-enforcing-new-in-javascript
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }
  var model = this;

  return model;
}

// These internals modules are exposed like this for unit testing.
ReactiveModel.SimpleModel = SimpleModel;
ReactiveModel.Graph = Graph;

export default ReactiveModel;
