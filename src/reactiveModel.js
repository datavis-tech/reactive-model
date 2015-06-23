import Graph from "./graph";
import ReactiveGraph from "./reactiveGraph";
import ReactiveFunction from "./reactiveFunction";

var reactiveGraph = new ReactiveGraph();
var changedPropertyNodes     = reactiveGraph.changedPropertyNodes;
var addReactiveFunction      = reactiveGraph.addReactiveFunction;
var makePropertyNode         = reactiveGraph.makePropertyNode;
var makeReactiveFunctionNode = reactiveGraph.makeReactiveFunctionNode;

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

  // { property -> value }
  var values = {};

  // { property -> node }
  var trackedProperties = {};

  function addPublicProperty(property, defaultValue){
    if(isFinalized){
      throw new Error("model.addPublicProperty() is being " +
        "invoked after model.finalize, but this is not allowed. "+
        "Public properties may only be added before the model is finalized.");
    }

    publicProperties[property] = defaultValue;
    values[property] = defaultValue;

    return model;
  }

  function createGetterSetter(property){
    return function (value){
      if (!arguments.length) {
        return values[property];
      }
      values[property] = value;

      var propertyNode = trackedProperties[property];
      changedPropertyNodes[propertyNode] = true;

      return model;
    };
  }

  function finalize(){
    if(isFinalized){
      throw new Error("model.finalize() is being invoked " +
        "more than once, but this function should only be invoked once.");
    }
    isFinalized = true;

    Object.keys(publicProperties).map(track);

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

  function react(options){
    var reactiveFunctions = ReactiveFunction.parse(options);
    reactiveFunctions.forEach(function (reactiveFunction){

      assignNodes(reactiveFunction);

      addReactiveFunction(reactiveFunction);

      reactiveFunction.inNodes.forEach(function (node){
        changedPropertyNodes[node] = true;
      });
    });
  }

  function track(property){
    if(property in trackedProperties){
      return trackedProperties[property];
    } else {
      var getterSetter = createGetterSetter(property);

      model[property] = getterSetter;

      var propertyNode = makePropertyNode(getterSetter);
      trackedProperties[property] = propertyNode;

      return propertyNode;
    }
  }

  function assignNodes(reactiveFunction){
    reactiveFunction.inNodes = reactiveFunction.inProperties.map(track);
    reactiveFunction.node = makeReactiveFunctionNode(reactiveFunction);
    reactiveFunction.outNode = track(reactiveFunction.outProperty);
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

export default ReactiveModel;
