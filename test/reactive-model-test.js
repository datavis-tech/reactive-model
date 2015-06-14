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

  //it("should evaluate the data dependency graph, property set after model.react", function (done){
  //  var model = new ReactiveModel();

  //  model.react({
  //    bar: ["foo", function (_){
  //      return _.foo + 1;
  //    }]
  //  });

  //  model.foo(5);

  //  ReactiveModel.digest();

  //  assert.equal(model.foo(), 5);
  //  assert.equal(model.bar(), 6);
  //});

  //it("should evaluate the data dependency graph, property set before model.react", function (){
  //  var model = new ReactiveModel();

  //  model.foo(5);

  //  model.react({
  //    bar: ["foo", function (_){
  //      return _.foo + 1;
  //    }]
  //  });

  //  ReactiveModel.digest();

  //  assert.equal(model.foo(), 5);
  //  assert.equal(model.bar(), 6);
  //});

  //it("should not evaluate when input is undefined", function (){
  //  var model = new ReactiveModel();
  //  var counter = 0;

  //  model.react({
  //    bar: ["foo", function (_){
  //      counter++;
  //      return _.foo + 1;
  //    }]
  //  });

  //  ReactiveModel.digest();

  //  assert.equal(counter, 0);
  //});

  //it("should evaluate computed properties", function (){
  //  var model = new ReactiveModel();
  //  var counter = 0;

  //  model.react({
  //    b: ["a", function (_){
  //      return _.a + 1;
  //    }],
  //    c: ["b", function (_){
  //      return _.b + 1;
  //    }]
  //  });
  //  
  //  model.a(1);

  //  ReactiveModel.digest();

  //  assert.equal(model.c(), 3);
  //});

  //it("should bind properties from different models", function (){
  //  var model1 = new ReactiveModel();
  //  var model2 = new ReactiveModel();

  //  ReactiveModel.bind(model1, "foo", model2, "bar");
  //  
  //  model1.foo(1);

  //  ReactiveModel.digest();

  //  assert.equal(model2.far(), 3);
  //});

});
