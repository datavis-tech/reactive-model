// Each reactive function gets a unique id.
// This is so reactive functions can be identified by strings,
// and those strings can be used as node ids in the dependency graph.
// For example, the string "λ45" identifies reactive function with id 45.
var reactiveFunctionIdCounter = 0;

// This function is a factory for objects that represent reactive functions,
// each having input properties, a single output property, and an associated callback.
function ReactiveFunction(inProperties, outProperty, callback){
  return {

    // Each ective function gets a unique id.
    id: reactiveFunctionIdCounter++,

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

module.exports = ReactiveFunction;
