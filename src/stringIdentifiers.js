module.exports = {
  encodeProperty: function (model, property){
    return model.id + "." + property;
  },
  encodeReactiveFunction: function (reactiveFunction) {
    return "λ" + reactiveFunction.id
  }
};
