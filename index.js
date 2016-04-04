// By Curran Kelleher April 2016

// TODO change to proper modules.
var ReactiveFunction = require("../reactive-function/index.js");
var ReactiveProperty = require("../reactive-property/index.js");

function ReactiveModel(){

  // The model instance object.
  // This is the value returned from the constructor.
  var model = function (options){
    console.log("Invoking model as a function");
    //return Object.keys(options).map(function (outProperty){
    //  var array = options[outProperty];
    //  var callback = array.splice(array.length - 1)[0];
    //  var inProperties = array;
    //  return ReactiveFunction(inProperties, outProperty, callback);
    //});
    //ReactiveFunction.parse(options).forEach(function (λ){
    //  assignNodes(λ);
    //  addReactiveFunction(λ);
    //});
  };

  // Keys are property names.
  // Values are reactive properties.
  var publicProperties = {};

  // Keys are property names.
  // Values are default values.
  var defaultValues = {};

  // Whether or not model.finalize() has been called.
  // This is required to guarantee predictable behavior of setState and getState.
  var isFinalized = false;

  // Adds a public property to this model.
  // The property name is required and will be used to reference this property.
  // The default value is required to guarantee predictable behavior of setState and getState.
  function addPublicProperty(propertyName, defaultValue, metadata){

    if(isFinalized){
      throw new Error("model.addPublicProperty() is being " +
        "invoked after model.finalize(), but this is not allowed. " +
        "Public properties may only be added before the model is finalized. " +
        "This is required to guarantee predictable behavior of setState and getState.");
    }

    // TODO test this
    // if(!isDefined(defaultValue)){
    //  throw new Error("model.addPublicProperty() is being " +
    //    "invoked with an undefined default value. Default values for public properties " +
    //    "must be defined, to guarantee predictable behavior. For public properties that " +
    //    "are optional and should have the semantics of an undefined value, " +
    //    "use ReactiveModel.NONE as the default value.");
    //}

    publicProperties[propertyName] = ReactiveProperty(defaultValue);
    defaultValues[propertyName] = defaultValue;

    // Support method chaining.
    return model;
  }

  function getDefaultValue(propertyName){
    return defaultValues[propertyName];
  }

  function finalize(){

    if(isFinalized){
      throw new Error("model.finalize() is being invoked " +
        "more than once, but this function should only be invoked once.");
    }

    isFinalized = true;

    // Expose the public properties on the model instance.
    Object.keys(publicProperties).forEach(function(propertyName){
      model[propertyName] = publicProperties[propertyName];
    });

    // Support method chaining.
    return model;
  }

  function getState(){
    //var state = {};
    //Object.keys(publicProperties).forEach( function (publicProperty){
    //  TODO omit default values.
    //  state[publicProperty] = values[publicProperty];
    //});
    //return state;
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
    Object.keys(publicProperties).forEach(function (propertyName){
      var defaultValue = publicProperties[propertyName];
      model[propertyName](defaultValue);
    });

    // Apply values included in the new state.
    Object.keys(state).forEach(function (propertyName){
      var newValue = state[propertyName]
      model[propertyName](newValue);
    });

    // Support method chaining.
    return model;
  }

  model.addPublicProperty = addPublicProperty;
  model.finalize = finalize;
  model.getState = getState;
  model.setState = setState;

  return model;
}

module.exports = ReactiveModel;
