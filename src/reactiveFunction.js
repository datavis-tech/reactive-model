// This file serves to document the reactive function data structure,
// and contains a utility function for parsing the options passed to model.react().
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

    // inNodes and outNodes are populated in the function reactiveModel.assignNodes(),
    // which is invoked after the original ReactiveFunction object is created.

    // An array of node id strings corresponding
    // to the property names in inProperties.
    inNodes: undefined,

    // The node id string corresponding to the output property.
    outNode: undefined
  };
}

// This function parses the options object passed into `model.react(options)`,
// transforming it into an array of ReactiveFunction instances.
ReactiveFunction.parse = function (options){
  return Object.keys(options).map(function (outProperty){
    var array = options[outProperty];
    var callback = array.splice(array.length - 1)[0];
    var inProperties = array;
    return ReactiveFunction(inProperties, outProperty, callback);
  });
};

export default ReactiveFunction;
