// By Curran Kelleher April 2016

// TODO change to proper modules.
var ReactiveFunction = require("../reactive-function/index.js");
var ReactiveProperty = require("../reactive-property/index.js");

function ReactiveModel(){

  // The model instance object.
  // This is the value returned from the constructor.
  var model = function (options){

    //console.log("Invoking model as a function");
    Object.keys(options).forEach(function (outputPropertyName){
      var arr = options[outputPropertyName];
      var inputsStr = arr.pop();
      var callback = arr.pop();

      // Convert the comma separated list of property names
      // into an array of reactive properties.
      var inputs = inputsStr.split(",").map(function (propertyName){
        propertyName = propertyName.trim();
        return model[propertyName];
      });

      // Create a new reactive property for the output and assign it to the model.
      var output = ReactiveProperty();
      model[outputPropertyName] = output;

      // TODO throw an error if the output property is already defined on the model.

      ReactiveFunction({
        inputs: inputs,
        output: output,
        callback: callback
      });
    });
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
    var state = {};
    Object.keys(publicProperties).forEach(function (propertyName){

      var value = publicProperties[propertyName]();

      // TODO throw an error if the property is missing.

      // Omit default values.
      if(value !== defaultValues[propertyName]){
        state[propertyName] = value;
      }
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
    Object.keys(publicProperties).forEach(function (propertyName){
      var oldValue = model[propertyName]();

      var newValue;
      if(propertyName in state){
        newValue = state[propertyName];
      } else {
        newValue = defaultValues[propertyName];
      }

      if(oldValue !== newValue){
        model[propertyName](newValue);
      }
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

ReactiveModel.digest = ReactiveFunction.digest;

module.exports = ReactiveModel;
