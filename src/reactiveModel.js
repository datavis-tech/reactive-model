// This is the top-level module exported by the reactive-model package.
// The exported function is a constructor for reactive models
// that also exposes the digest() function, which synchronously
// evaluates the data dependency graph.

// By Curran Kelleher June 2015

import Graph from "./graph";
import ReactiveGraph from "./reactiveGraph";
import ReactiveFunction from "./reactiveFunction";
import { nextFrame, animationFrameDebounce } from "./animationFrameDebounce";

var reactiveGraph = new ReactiveGraph();

var addReactiveFunction      = reactiveGraph.addReactiveFunction;
var makePropertyNode         = reactiveGraph.makePropertyNode;
var makeReactiveFunctionNode = reactiveGraph.makeReactiveFunctionNode;
var propertyNodeDidChange    = reactiveGraph.propertyNodeDidChange;

var scheduleDigest = animationFrameDebounce(reactiveGraph.digest);

function ReactiveModel(){
  
  // Enforce use of new, so instanceof and typeof checks will always work.
  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  // Refer to `this` (the ReactiveModel instance) as `model` in this closure.
  var model = this;

  // { property -> defaultValue }
  var publicProperties = {};

  // { property -> value }
  var values = {};

  // { property -> node }
  var trackedProperties = {};

  var isFinalized = false;

  function addPublicProperty(property, defaultValue){
    if(isFinalized){
      throw new Error("model.addPublicProperty() is being " +
        "invoked after model.finalize, but this is not allowed. "+
        "Public properties may only be added before the model is finalized.");
    }

    // TODO test this
    // if(isDefined(defaultValue)){
    //  throw new Error("model.addPublicProperty() is being " +
    //    "invoked with an undefined default value. Default values for public properties " +
    //    "must be defined, to guarantee predictable behavior. For public properties that " +
    //    "are optional and should have the semantics of an undefined value, " +
    //    "use ReactiveModel.NONE as the default value.");
    //}

    publicProperties[property] = defaultValue;

    return model;
  }

  function getDefaultValue(property){
    return publicProperties[property];
  }

  function finalize(){
    if(isFinalized){
      throw new Error("model.finalize() is being invoked " +
        "more than once, but this function should only be invoked once.");
    }
    isFinalized = true;

    Object.keys(publicProperties).forEach(function(property){
      track(property);
      model[property](getDefaultValue(property));
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

    // TODO throw an error if some property in state
    // is not in publicProperties
    //Object.keys(state).forEach(function (property){
    //  if(!property in publicProperties){
    //    throw new Error("Attempting to set a property that has not" +
    //      " been added as a public property in model.setState()");
    //  }
    //});

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

  function react(options){
    ReactiveFunction.parse(options).forEach(function (λ){
      assignNodes(λ);
      addReactiveFunction(λ);
    });
  }

  function assignNodes(λ){
    λ.inNodes = λ.inProperties.map(track);
    λ.node = makeReactiveFunctionNode(λ);
    λ.outNode = track(λ.outProperty);
  }

  function track(property){
    if(property in trackedProperties){
      return trackedProperties[property];
    } else {
      var getterSetter = createGetterSetter(property);
      var propertyNode = makePropertyNode(getterSetter);
      model[property] = getterSetter;
      trackedProperties[property] = propertyNode;
      return propertyNode;
    }
  }

  function createGetterSetter(property){
    return function (value){
      if (!arguments.length) {
        return values[property];
      }
      values[property] = value;
      propertyDidChange(property);
      return model;
    };
  }

  function propertyDidChange(property){
    var propertyNode = trackedProperties[property];
    propertyNodeDidChange(propertyNode);
    scheduleDigest();
  }

  model.addPublicProperty = addPublicProperty;
  model.finalize = finalize;
  model.getState = getState;
  model.setState = setState;
  model.react = react;
}

ReactiveModel.digest = reactiveGraph.digest;

// Export these internal modules for unit testing via Rollup CommonJS build.
ReactiveModel.Graph = Graph;
ReactiveModel.ReactiveGraph = ReactiveGraph;
ReactiveModel.ReactiveFunction = ReactiveFunction;
ReactiveModel.nextFrame = nextFrame;

export default ReactiveModel;
