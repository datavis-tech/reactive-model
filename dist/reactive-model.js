(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('graph')) :
	typeof define === 'function' && define.amd ? define(['exports', 'graph'], factory) :
	factory((global.ReactiveModel = {}), global.Graph)
}(this, function (exports, Graph) { 'use strict';

	Graph = ('default' in Graph ? Graph['default'] : Graph);

	var dependencyGraph = new Graph();

	// Currently trying to just get bundling to work and settle on tooling.
	function ReactiveModel(){
	}

	//function ReactiveFunction(inProperties, outProperty, callback){
	//  return {
	//    inProperties: inProperties, // [String]
	//    outProperty: outProperty,   // String
	//    callback: callback          // function (...inProperties) -> outPropertyValue
	//  };
	//}
	//
	//function allAreDefined(arr){
	//  return !arr.some(isNotDefined);
	//}
	//
	//function isNotDefined(d){
	//  return typeof d === 'undefined' || d === null;
	//}
	//
	//function debounce(callback){
	//  var queued = false;
	//  return function () {
	//    if(!queued){
	//      queued = true;
	//      setTimeout(function () {
	//        queued = false;
	//        callback();
	//      }, 0);
	//    }
	//  };
	//}
	//
	//export function ReactiveModel(){
	//
	//  if (!(this instanceof ReactiveModel)) {
	//    return new ReactiveModel();
	//  }
	//
	//  var model = this;
	//  var values = {};
	//  var trackedProperties = {};
	//  var reactiveFunctions = {};
	//
	//  function getReactiveFunctions(inProperty){
	//    if( !(inProperty in reactiveFunctions) ){
	//      return reactiveFunctions[inProperty] = [];
	//    } else {
	//      return reactiveFunctions[inProperty];
	//    }
	//  }
	//
	//  var invoke = function(reactiveFunction){
	//    var args = reactiveFunction.inProperties.map( function (inProperty){
	//      return values[inProperty];
	//    });
	//    if(allAreDefined(args)){
	//      reactiveFunction.callback.apply(null, args);
	//    }
	//  };
	//
	//  model.react = function (options){
	//    Object.keys(options).forEach( function (outProperty){
	//
	//      var arr = options[outProperty];
	//
	//      var inPropertiesStr = arr[0];
	//      var callback        = arr[1]; 
	//
	//      var inProperties = inPropertiesStr.split(",").map( function (inPropertyStr){
	//        return inPropertyStr.trim();
	//      });
	//
	//      var reactiveFunction = ReactiveFunction(inProperties, outProperty, callback);
	//
	//      inProperties.forEach(function (inProperty){
	//        getReactiveFunctions(inProperty).push(reactiveFunction);
	//        track(inProperty);
	//      });
	//
	//      invoke(reactiveFunction);
	//    });
	//  };
	//
	//  function track(property){
	//    if( !trackedProperties[property] ){
	//      trackedProperties[property] = true;
	//
	//      var previousValue = model[property];
	//
	//      Object.defineProperty(model, property, {
	//        get: function (){
	//          return values[property];
	//        },
	//        set: function (value){
	//          values[property] = value;
	//          
	//          // TODO test this path
	//          //getReactiveFunctions(property).forEach(invoke);
	//        }
	//      });
	//
	//      if(!isNotDefined(previousValue)){
	//        model[property] = previousValue;
	//      }
	//    }
	//  }
	//
	//  return model;
	//};

	exports.ReactiveModel = ReactiveModel;

}));