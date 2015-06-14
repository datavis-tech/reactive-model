function SimpleModel(){

  var values = {};
  var listeners = {};

  function getListeners(property){
    return listeners[property] || (listeners[property] = []);
  }

  function on(property, callback){
    getListeners(property).push(callback);
  }

  // TODO off(property, callback)

  function set(property, value){
    setSilently(property, value);
    getListeners(property).forEach(invoke);
  }

  function setSilently(property, value){
    values[property] = value;
  }

  function get(property){
    return values[property];
  }

  return {
    on: on,
    set: set,
    setSilently: setSilently,
    get: get
  };
}

function invoke(callback){
  callback();
}

export default SimpleModel;
