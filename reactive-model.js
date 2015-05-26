(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ReactiveModel = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = "test";
//export default class ReactiveModel {
//
//  constructor() {
//    this._trackedProperties = {};
//    this._values = {};
//    this._reactiveFunctions = {};
//    this._changedProperties = {};
//    this._digestIsQueued = false;
//  }
//
//  react(options){
//    Object.keys(options).forEach( (outProperty) => {
//
//      // Parse options.
//      var [inPropertiesStr, callback] = options[outProperty];
//      var inProperties = inPropertiesStr.split(",").map( str => str.trim() );
//
//      var reactiveFunction = {
//        inProperties: inProperties,
//        outProperty: outProperty,
//        callback: callback
//      };
//
//      inProperties.forEach( (inProperty) => {
//        this._getReactiveFunctions(inProperty).push(reactiveFunction);
//        this._track(inProperty);
//      });
//    });
//  }
//
//  _getReactiveFunctions(inProperty){
//    var fns = this._reactiveFunctions;
//    return fns[inProperty] || (fns[inProperty] = []);
//  }
//
//  _track(property){
//    if(!(property in this._trackedProperties)){
//      this._trackedProperties[property] = true;
//      this._values[property] = this[property];
//      Object.defineProperty(this, property, {
//        get(){ return this._values[property] },
//        set(value){
//          this.set({ [property] : value });
//        }
//      });
//    }
//  }
//
//  set(state){
//    var changedProperties = Object.keys(state);
//    changedProperties.forEach( (property) => {
//      this._track(property);
//      this._values[property] = state[property];
//      this._changedProperties[property] = true;
//    });
//    return this._queueDigest();
//  }
//
//  _queueDigest(){
//    if(!this._digestPromise){
//      this._digestPromise = new Promise((fulfill, reject) => {
//        requestAnimationFrame(() => {
//          this._digest(Object.keys(this._changedProperties));
//          this._changedProperties = {};
//          fulfill();
//        });
//      });
//    }
//    return this._digestPromise;
//  }
//
//  _digest(changedProperties){
//    var newlyChangedProperties = {};
//    changedProperties.forEach( (property) => {
//      this._getReactiveFunctions(property).forEach( (reactiveFunction) => {
//        var args = reactiveFunction.inProperties.map( (inProperty) => {
//          return values[inProperty];
//        });
//        if(allAreDefined(args)){
//          reactiveFunction.callback();
//          newlyChangedProperties[reactiveFunction.outProperty] = true;
//        }
//      });
//    });
//
//    // TODO test
//    //this._digest(Object.keys(newlyChangedProperties));
//  }
//}
//
//// Returns true if all elements of the given array are defined, false otherwise.
//function allAreDefined(arr){
//  return !arr.some(function (d) {
//    return typeof d === 'undefined' || d === null;
//  });
//}

},{}]},{},[1])(1)
});