// By Curran Kelleher April 2016

var ReactiveFunction = require("reactive-function");
var ReactiveProperty = require("reactive-property");

function ReactiveModel(){

  // Keys are public property names.
  // Values are default values.
  var publicPropertyDefaults = {};

  // Set to true after model.setState() or model.getState() has been called.
  // Public properties may not be added after this has been set to true.
  // This is tracked to guarantee predictable behavior.
  var isFinalized = false;

  // An array of reactive functions that have been set up on this model.
  // These are tracked only so they can be destroyed in model.destroy().
  var reactiveFunctions = [];

  // The state of the model is represented as an object and stored
  // in this reactive property. Note that only values for public properties
  // whose values differ from their defaults are included in the state.
  // The purpose of this is for serialization and deserialization, so 
  // default values are left out for a concise serialized form.
  var stateGetterSetter = ReactiveProperty({});

  // This is a reactive function set up to listen for changes in all
  // public properties and set the stateGetterSetter value.
  var stateReactiveFunction;

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

        // Trim leading and trailing white space around property names.
        propertyName = propertyName.trim();

        // Return the reactive property attached to the model with that name.
        // TODO throw an error if a property is not on the model.
        return model[propertyName];
      });

      // Create a new reactive property for the output and assign it to the model.
      var output = ReactiveProperty();

      // TODO throw an error if the output property is already defined on the model.
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
            args.push(output);

            // Wrap in setTimeout to guarantee that the output property is set
            // asynchronously, outside of the current digest.
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

  // Adds a public property to this model.
  // The property name is required and will be used to reference this property.
  // The default value is required to guarantee predictable behavior of setState and getState.
  function addPublicProperty(propertyName, defaultValue, metadata){

    if(isFinalized){
      throw new Error("model.addPublicProperty() is being " +
        "invoked after model.setState() or model.getState(), but this is not allowed. " +
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

    model[propertyName] = ReactiveProperty(defaultValue);
    publicPropertyDefaults[propertyName] = defaultValue;

    // Destroy the previous reactive function that was listening for changes
    // in all public properties except the newly added one.
    if(stateReactiveFunction){
      stateReactiveFunction.destroy();
    }

    // Set up the new reactive function that listens for changes
    // in all public properties including the newly added one.
    var publicPropertyNames = Object.keys(publicPropertyDefaults);
    var publicProperties = publicPropertyNames.map(function (propertyName){
      return model[propertyName];
    });

    stateReactiveFunction = ReactiveFunction({
      inputs: publicProperties,
      output: stateGetterSetter,
      callback: function (){
        var state = {};
        publicPropertyNames.forEach(function (propertyName){
          var value = model[propertyName]();
          var defaultValue = publicPropertyDefaults[propertyName];

          // Omit default values.
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


  //function setState(state){
  //  isFinalized = true;

  //  // TODO throw an error if some property in state
  //  // is not in publicProperties
  //  //Object.keys(state).forEach(function (property){
  //  //  if(!property in publicProperties){
  //  //    throw new Error("Attempting to set a property that has not" +
  //  //      " been added as a public property in model.setState()");
  //  //  }
  //  //});

  //  // Reset state to default values.
  //  Object.keys(publicPropertyDefaults).forEach(function (propertyName){
  //    var oldValue = model[propertyName]();

  //    var newValue;
  //    if(propertyName in state){
  //      newValue = state[propertyName];
  //    } else {
  //      newValue = publicPropertyDefaults[propertyName];
  //    }

  //    if(oldValue !== newValue){
  //      model[propertyName](newValue);
  //    }
  //  });

  //  // Support method chaining.
  //  return model;
  //}

  function destroy(){
    
    // Destroy all reactive functions that have been added to the model.
    reactiveFunctions.forEach(function (reactiveFunction){
      reactiveFunction.destroy();
    });

    // TODO test bind case
  }

  model.addPublicProperty = addPublicProperty;
  model.state = stateGetterSetter;
  //model.getState = getState;
  //model.setState = setState;
  model.destroy = destroy;

  return model;
}

ReactiveModel.digest = ReactiveFunction.digest;

module.exports = ReactiveModel;
