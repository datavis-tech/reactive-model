import SimpleModel from "./simpleModel";
import Graph from "./graph";
import ReactiveGraph from "./reactiveGraph";
import ReactiveFunction from "./reactiveFunction";

function ReactiveModel(){

  var simpleModel = SimpleModel();

  // Enforce use of new.
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }
  var model = this;

  // { property -> true }
  var trackedProperties = {};

  function react(options){

    // This parses options and generates an array of reactive functions,
    // each of which has the properties `inProperties` and `outProperties` populated.
    var reactiveFunctions = ReactiveFunction.parse(options);

    // Track in and out properties.
    reactiveFunctions.forEach(function (reactiveFunction){
      reactiveFunction.inProperties.forEach(track);
      track(reactiveFunction.outProperty);
    });

    return reactiveFunctions;
  };

  function track(property){
    if(!(property in trackedProperties)){
      trackedProperties[property] = true;

      model[property] = function(value){
        if (!arguments.length) return simpleModel.get(property);
        simpleModel.set(property, value);
        return model;
      };
    }
  }

  model.react = react;

  return model;
}

// These internals modules are exposed like this for unit testing.
ReactiveModel.SimpleModel = SimpleModel;
ReactiveModel.Graph = Graph;

export default ReactiveModel;
