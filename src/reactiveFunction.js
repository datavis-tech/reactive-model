function ReactiveFunction(inProperties, outProperty, callback){
  return {

    // An array of input property names.
    inProperties: inProperties,

    // The output property name.
    outProperty: outProperty,

    // function (inPropertyValues) -> outPropertyValue
    // Invoked during a digest,
    //   - when all input property values are first defined,
    //   - in response to any changes in input property values.
    callback: callback,

    // inNodes and outNodes are populated in the function assignNodes(),
    // which is invoked after the original ReactiveFunction object is created.

    // An array of node id strings corresponding
    // to the property names in inProperties.
    inNodes: undefined,

    // The node id string corresponding to the output property.
    outNode: undefined
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
