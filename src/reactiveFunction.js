function ReactiveFunction(inProperties, outProperty, callback){
  return {

    // An array of property name strings.
    inProperties: inProperties,

    // A single property name string.
    outProperty: outProperty,

    // function (...inProperties) -> outPropertyValue
    // Invoked when all input properties are defined,
    // at most once each animation frame with most recent values,
    // triggered whenever input properties change.
    callback: callback
  };
}

// This is where the options object passed into `model.react(options)` gets
// transformed into an array of ReactiveFunction instances.
ReactiveFunction.parse = function (options){
  return Object.keys(options).map( function (outProperty){
    var arr = options[outProperty];
    var callback = arr.splice(arr.length - 1)[0];
    var inProperties = arr;
    return ReactiveFunction(inProperties, outProperty, callback);
  });
};

export default ReactiveFunction;
