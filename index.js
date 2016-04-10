// By Curran Kelleher April 2016

var ReactiveFunction = require("reactive-function");
var ReactiveProperty = require("reactive-property");

// Functional utility for invoking methods on collections.
function invoke(method){
  return function(d){
    return d[method]();
  };
}

// Parses the options data structure passed into model(options).
// Returns an array of reactive function specifications.
function parseOptions(options){
  return Object.keys(options).map(function (outputPropertyName){

    var arr = options[outputPropertyName];
    var inputsStr = arr.pop();
    var callback = arr.pop();

    var inputPropertyNames = inputsStr
      .split(",")
      .map(invoke("trim"));

    var reactiveFunctionSpec = {
      outputPropertyName: outputPropertyName,
      inputPropertyNames: inputPropertyNames,
      callback: callback
    };

    return reactiveFunctionSpec;
  });
}

// The constructor for reactive models.
// This function is exported as the public API of this module.
function ReactiveModel(){

  // This object stores the default values for all public properties.
  // Keys are public property names.
  // Values are default values.
  var publicPropertyDefaults = {};

  // This function returns an array of public property names.
  var publicPropertyNames = function (){
    return Object.keys(publicPropertyDefaults);
  }

  // The state of the model is represented as an object and stored
  // in this reactive property. Note that only values for public properties
  // whose values differ from their defaults are included in the state object.
  // The purpose of the state accessor API is serialization and deserialization,
  // so default values are left out for a concise serialized form.
  var stateProperty = ReactiveProperty();

  // This is a reactive function set up to listen for changes in all
  // public properties and set the stateProperty value.
  var stateReactiveFunction;

  // Set to true after state has been accessed through the public API.
  // Public properties may not be added after this has been set to true.
  // This is tracked to guarantee predictable state accessor behavior.
  var isFinalized = false;

  // An array of reactive functions that have been set up on this model.
  // These are tracked only so they can be destroyed in model.destroy().
  var reactiveFunctions = [];

  // The model instance object.
  // This is the value returned from the constructor.
  var model = function (options){
    parseOptions(options).forEach(function (reactiveFunctionSpec){
    
      // Unpack the parsed reactive function specification.
      var outputPropertyName = reactiveFunctionSpec.outputPropertyName;
      var inputPropertyNames = reactiveFunctionSpec.inputPropertyNames;
      var callback = reactiveFunctionSpec.callback;

      // TODO throw an error if a property is not on the model.
      var inputs = inputPropertyNames.map(getProperty);

      // Create a new reactive property for the output and assign it to the model.
      // TODO throw an error if the output property is already defined on the model.
      var output = ReactiveProperty();
      model[outputPropertyName] = output;

      // If the number of arguments expected by the callback is one greater than the
      // number of inputs, then the last argument is the "done" callback, and this
      // reactive function will be set up to be asynchronous. The "done" callback should
      // be called with the new value of the output property asynchronously.
      var isAsynchronous = (callback.length === inputs.length + 1);
      if(isAsynchronous){
        reactiveFunctions.push(ReactiveFunction({
          inputs: inputs,
          callback: function (){

            // Convert the arguments passed into this function into an array.
            var args = Array.prototype.slice.call(arguments);

            // Push the "done" callback onto the args array.
            // We are actally passing the output reactive property here, invoking it
            // as the "done" callback will set the value of the output property.
            args.push(output);

            // Wrap in setTimeout to guarantee that the output property is set
            // asynchronously, outside of the current digest. This is necessary
            // to ensure that if developers inadvertently invoke the "done" callback 
            // synchronously, their code will still have the expected behavior.
            setTimeout(function (){

              // Invoke the original callback with the args array as arguments.
              callback.apply(null, args);
            });
          }
        }));
      } else {
        reactiveFunctions.push(ReactiveFunction({
          inputs: inputs,
          output: output,
          callback: callback
        }));
      }
    });
  };

  // Gets a reactive property from the model by name.
  // Convenient for functional patterns like `propertyNames.map(getProperty)`
  function getProperty(propertyName){
    return model[propertyName];
  }

  // Adds a public property to the model.
  // The property name is required and will be used to reference this property.
  // The default value is required to guarantee predictable behavior of the state accessor.
  function addPublicProperty(propertyName, defaultValue, metadata){

    if(isFinalized){
      throw new Error("model.addPublicProperty() is being " +
        "invoked after model.state() has been accessed, but this is not allowed. " +
        "This is required to guarantee predictable behavior of the state accessor.");
    }

    // TODO test this
    // if(!isDefined(defaultValue)){
    //  throw new Error("model.addPublicProperty() is being " +
    //    "invoked with an undefined default value. Default values for public properties " +
    //    "must be defined, to guarantee predictable behavior. For public properties that " +
    //    "are optional and should have the semantics of an undefined value, " +
    //    "use ReactiveModel.NONE as the default value.");
    //}

    // Add a new reactive property to the model.
    // TODO throw an error if a property with this name is already defined.
    model[propertyName] = ReactiveProperty(defaultValue);

    // Store the default value for later reference.
    publicPropertyDefaults[propertyName] = defaultValue;

    // Destroy the previous reactive function that was listening for changes
    // in all public properties except the newly added one.
    if(stateReactiveFunction){
      stateReactiveFunction.destroy();
    }

    // Set up the new reactive function that will listen for changes
    // in all public properties including the newly added one.
    var inputPropertyNames = publicPropertyNames();
    stateReactiveFunction = ReactiveFunction({
      inputs: inputPropertyNames.map(getProperty),
      output: stateProperty,
      callback: function (){
        var state = {};
        inputPropertyNames.forEach(function (propertyName){
          var value = model[propertyName]();
          var defaultValue = publicPropertyDefaults[propertyName];

          // Omit default values from the returned state object.
          if(value !== defaultValue){
            state[propertyName] = value;
          }
        });
        return state;
      }
    });

    // Support method chaining.
    return model;
  }

  function setState(newState){

    // TODO throw an error if some property in state
    // is not in publicProperties
    //Object.keys(state).forEach(function (property){
    //  if(!property in publicPropertyDefaults){
    //    throw new Error("Attempting to set a property that has not" +
    //      " been added as a public property in model.state(newState)");
    //  }
    //});

    publicPropertyNames().forEach(function (propertyName){
      var oldValue = model[propertyName]();

      var newValue;
      if(propertyName in newState){
        newValue = newState[propertyName];
      } else {
        newValue = publicPropertyDefaults[propertyName];
      }

      if(oldValue !== newValue){
        model[propertyName](newValue);
      }
    });
  }

  // Destroys all reactive functions that have been added to the model.
  function destroy(){
    
    reactiveFunctions.forEach(invoke("destroy"));

    // TODO destroy all properties on the model, remove their listeners and nodes in the graph.

    // TODO test bind case
  }

  // This is the public facing wrapper around stateProperty.
  // This is necessary to enforce the policy that no public properties
  // may be added after the state has been get or set from the public API.
  // This is required to guarantee predictable state accessor behavior.
  function stateAccessor(newState){

    // Mark the model as "finalized" if the state is accessed via the public API.
    // If developers attempt to add public properties after this flag is set,
    // errors will be thrown.
    isFinalized = true;

    // Invoke the setState logic only when the state is set via the public API.
    if(arguments.length == 1){
      setState(newState);
    }

    // Pass through the getter/setter invocation to stateProperty.
    return stateProperty.apply(model, arguments);
  }
  stateAccessor.on = stateProperty.on;

  model.addPublicProperty = addPublicProperty;
  model.state = stateAccessor;
  model.destroy = destroy;

  return model;
}

ReactiveModel.digest = ReactiveFunction.digest;

module.exports = ReactiveModel;
