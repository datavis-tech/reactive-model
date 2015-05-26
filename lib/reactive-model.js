module.exports = function ReactiveModel(){

  if (!(this instanceof ReactiveModel)) {
    return new ReactiveModel();
  }

  var model = this;

  var values = {};

  model.set = function (state){

    var changedPropertiesArr = Object.keys(state);

    changedPropertiesArr.forEach( function (property){
      track(property);
      values[property] = state[property];
      //changedProperties[property] = true;
    });
  };

  function track(property){
  
    if( !(property in values) ){

      // TODO test for this line.
      //values[property] = model[property];

      Object.defineProperty(model, property, {
        get: function (){
          return values[property];
        },
        set: function (value){
          var state = {};
          state[property] = value;
          model.set(state);
        }
      });
    }
  }

  return model;
};
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
