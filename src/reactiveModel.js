import Graph from "./graph";
import ReactiveFunction from "./reactiveFunction";

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

    return model;
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

    return model;
  }

  function getState(){
    var state = {};
    Object.keys(publicProperties).forEach( function (publicProperty){
      state[publicProperty] = values[publicProperty];
    });
    return state;
  }

  function setState(state){

    // Reset state to default values.
    Object.keys(publicProperties).forEach(function (property){
      var defaultValue = publicProperties[property];
      model[property](defaultValue);
    });

    // Apply values included in the new state.
    Object.keys(state).forEach(function (property){
      var newValue = state[property]
      model[property](newValue);
    });

    return model;
  }

  model.addPublicProperty = addPublicProperty;
  model.finalize = finalize;
  model.getState = getState;
  model.setState = setState;
}

// Export Graph for unit testing via Rollup CommonJS build.
ReactiveModel.Graph = Graph;

export default ReactiveModel;
