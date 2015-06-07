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

  var outProperties = Object.keys(options);

  return outProperties.map( function (outProperty){

    var arr = options[outProperty];

    // The first element in the array should be a comma delimited
    // list of input property names.
    var inPropertiesStr = arr[0];
    var inProperties = inPropertiesStr.split(",").map( function (inPropertyStr){
      return inPropertyStr.trim();
    });

    // The second element in the array should be a callback.
    var callback = arr[1]; 

    return ReactiveFunction(inProperties, outProperty, callback);
  });
};

export default ReactiveFunction;
