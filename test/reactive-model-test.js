var ReactiveModel = require("../reactive-model.js");

var assert = require("assert");

describe("ReactiveModel", function (){

  it("should be a function", function (){
    assert.equal(typeof ReactiveModel, "function");
  });

  it("should enforce new", function (){
    var model1 = ReactiveModel();
    var model2 = new ReactiveModel();

    assert(model1 instanceof ReactiveModel);
    assert(model2 instanceof ReactiveModel);
  });

  //it("should create getter-setters for public properties", function (){
  //  var model = new ReactiveModel();

  //  model.addPublicProperty("x", 5);
  //  
  //  model.finalize();

  //  assert.equal(model.x(), 6);
  //});

});
