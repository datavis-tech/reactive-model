// By Curran Kelleher April 2016

var ReactiveFunction = require("reactive-function");
var ReactiveProperty = require("reactive-property");

// Functional utility for invoking methods on collections.
function invoke(method){
  return function(d){
    return d[method]();
  };
}

// The constructor for reactive models.
// This function is exported as the public API of this module.
function ReactiveModel(){

  // This object stores the default values for all public properties.
  // Keys are public property names.
  // Values are default values.
  var publicPropertyDefaults = {};

  // Returns an array of public property names.
  var publicPropertyNames = function (){
    return Object.keys(publicPropertyDefaults);
  };

  // This is a string, the name of the last property added.
  // This is used in `expose()`;
  var lastPropertyAdded;

  // The configuration of the model is represented as an object and stored
  // in this reactive property. Note that only values for public properties
  // whose values differ from their defaults are included in the configuration object.
  // The purpose of the configuration accessor API is serialization and deserialization,
  // so default values are left out for a concise serialized form.
  var configurationProperty = ReactiveProperty();

  // This is a reactive function set up to listen for changes in all
  // public properties and set the configurationProperty value.
  var configurationReactiveFunction;

  // An array of reactive functions that have been set up on this model.
  // These are tracked only so they can be destroyed in model.destroy().
  var reactiveFunctions = [];

  // The model instance object.
  // This is the value returned from the constructor.
  var model = function (){
    var outputPropertyName, callback, inputPropertyNames

    if(arguments.length === 0){
      return configurationProperty();
    } else if(arguments.length === 1){
      if(typeof arguments[0] === "object"){

        // The invocation is of the form model(configuration)
        return setConfiguration(arguments[0]);
      } else {

        // The invocation is of the form model(propertyName)
        return addProperty(arguments[0]);
      }
    } else if(arguments.length === 2){
      if(typeof arguments[0] === "function"){

        // The invocation is of the form model(callback, inputPropertyNames)
        inputPropertyNames = arguments[1];
        callback = arguments[0];
        outputPropertyName = undefined;
      } else {

        // The invocation is of the form model(propertyName, defaultValue)
        return addProperty(arguments[0], arguments[1]);
      }
    } else if(arguments.length === 3){
      outputPropertyName = arguments[0];
      callback = arguments[1];
      inputPropertyNames = arguments[2];
    }

    // inputPropertyNames may be a string of comma-separated property names,
    // or an array of property names.
    if(typeof inputPropertyNames === "string"){
      inputPropertyNames = inputPropertyNames.split(",").map(invoke("trim"));
    }

    // TODO throw an error if a property is not on the model.
    var inputs = inputPropertyNames.map(getProperty);

    // Create a new reactive property for the output and assign it to the model.
    // TODO throw an error if the output property is already defined on the model.
    if(outputPropertyName){
      var output = ReactiveProperty();
      model[outputPropertyName] = output;
    }

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
        output: output, // This may be undefined.
        callback: callback
      }));
    }
    return model;
  };

  // Gets a reactive property from the model by name.
  // Convenient for functional patterns like `propertyNames.map(getProperty)`
  function getProperty(propertyName){
    return model[propertyName];
  }

  // Adds a property to the model that is not public,
  // meaning that it is not included in the configuration object.
  function addProperty(propertyName, defaultValue){
    model[propertyName] = ReactiveProperty(defaultValue);
    lastPropertyAdded = propertyName;
    return model;

    // TODO throw an error if the name is not available (e.g. another property name, "configuration" or "addPublicProperty").
  }

  // Exposes the last added property to the configuration.
  function expose(){

    // TODO test this
    // if(!isDefined(defaultValue)){
    //  throw new Error("model.addPublicProperty() is being " +
    //    "invoked with an undefined default value. Default values for public properties " +
    //    "must be defined, to guarantee predictable behavior. For public properties that " +
    //    "are optional and should have the semantics of an undefined value, " +
    //    "use null as the default value.");
    //}

    // TODO test this
    if(!lastPropertyAdded){
      throw Error("Expose() was called without first adding a property.");
    }

    var propertyName = lastPropertyAdded;

    // Store the default value for later reference.
    publicPropertyDefaults[propertyName] = getProperty(propertyName)();

    // Destroy the previous reactive function that was listening for changes
    // in all public properties except the newly added one.
    // TODO think about how this might be done only once, at the same time isFinalized is set.
    if(configurationReactiveFunction){
      configurationReactiveFunction.destroy();
    }

    // Set up the new reactive function that will listen for changes
    // in all public properties including the newly added one.
    var inputPropertyNames = publicPropertyNames();
    //console.log(inputPropertyNames);
    configurationReactiveFunction = ReactiveFunction({
      inputs: inputPropertyNames.map(getProperty),
      output: configurationProperty,
      callback: function (){
        var configuration = {};
        inputPropertyNames.forEach(function (propertyName){
          var value = model[propertyName]();
          var defaultValue = publicPropertyDefaults[propertyName];

          // Omit default values from the returned configuration object.
          if(value !== defaultValue){
            configuration[propertyName] = value;
          }
        });
        return configuration;
      }
    });

    // Support method chaining.
    return model;
  }

  function setConfiguration(newConfiguration){

    // TODO throw an error if some property in configuration
    // is not in publicProperties
    //Object.keys(configuration).forEach(function (property){
    //  if(!property in publicPropertyDefaults){
    //    throw new Error("Attempting to set a property that has not" +
    //      " been added as a public property in model.configuration(newConfiguration)");
    //  }
    //});

    publicPropertyNames().forEach(function (propertyName){
      var oldValue = model[propertyName]();

      var newValue;
      if(propertyName in newConfiguration){
        newValue = newConfiguration[propertyName];
      } else {
        newValue = publicPropertyDefaults[propertyName];
      }

      if(oldValue !== newValue){
        model[propertyName](newValue);
      }
    });

    return model;
  }

  // Destroys all reactive functions that have been added to the model.
  function destroy(){
    
    reactiveFunctions.forEach(invoke("destroy"));

    // TODO destroy all properties on the model, remove their listeners and nodes in the graph.

    // TODO test bind case
  }

  function call (fn){
    var args = Array.prototype.slice.call(arguments);
    args[0] = model;
    fn.apply(null, args);
    return model;
  };

  model.expose = expose;
  model.destroy = destroy;
  model.call = call;
  model.on = function (callback){
  
    // Ensure the callback is invoked asynchronously,
    // so that property values can be set inside it.
    return configurationProperty.on(function (newConfiguration){
      setTimeout(function (){
        callback(newConfiguration);
      }, 0);
    });
  };

  model.off = configurationProperty.off;

  return model;
}

ReactiveModel.digest = ReactiveFunction.digest;
//ReactiveModel.nextFrame = ReactiveFunction.nextFrame;

module.exports = ReactiveModel;
