var ReactiveModel = require("../reactive-model.js");
var assert = require("assert");
require("source-map-support").install();

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

  it("should throw an error if finalizing twice", function (){
    var model = new ReactiveModel();
    model.addPublicProperty("x", 5);
    model.finalize();
    assert.throws(model.finalize, Error);
  });

  it("should throw an error if adding public property after finalize", function (){
    var model = new ReactiveModel();
    model.addPublicProperty("x", 5);
    model.finalize();
    assert.throws(model.addPublicProperty, Error);
  });

  it("should create getter-setters that get public properties", function (){
    var model = new ReactiveModel();
    model.addPublicProperty("x", 5);
    model.finalize();
    assert.equal(model.x(), 5);
  });

  it("should create getter-setters that set public properties", function (){
    var model = new ReactiveModel();
    model.addPublicProperty("x", 5);
    model.finalize();
    model.x(6);
    assert.equal(model.x(), 6);
  });

  it("should create getter-setters that chain", function (){
    var model = new ReactiveModel();
    model.addPublicProperty("x", 5);
    model.addPublicProperty("y", 6);
    model.finalize();
    model.x(10).y(20);
    assert.equal(model.x(), 10);
    assert.equal(model.y(), 20);
  });

  it("should chain addPublicProperty and finalize", function (){
    var model = new ReactiveModel()
      .addPublicProperty("x", 5)
      .addPublicProperty("y", 6)
      .finalize();

    model.y(20);

    assert.equal(model.x(), 5);
    assert.equal(model.y(), 20);
  });

  it("should get state", function (){
    var model = new ReactiveModel();
    model.addPublicProperty("x", 5);
    model.addPublicProperty("y", 10);
    model.finalize();

    var state = model.getState();
    assert.equal(state.x, 5);
    assert.equal(state.y, 10);
  });

  it("should get state after modification with getter-setters", function (){
    var model = new ReactiveModel();
    model.addPublicProperty("x", 5);
    model.addPublicProperty("y", 10);
    model.finalize();

    model.x(10).y(20)

    var state = model.getState();
    assert.equal(state.x, 10);
    assert.equal(state.y, 20);
  });
  
  function createModel(){
    return new ReactiveModel()
      .addPublicProperty("x", 5)
      .addPublicProperty("y", 6)
      .finalize();
  }

  it("should set state", function (){
    var modelA = createModel().x(10).y(20);
    var modelB = createModel();

    modelB.setState(modelA.getState());

    assert.equal(modelB.x(), 10);
    assert.equal(modelB.y(), 20);
  });

  it("should set state that omits default values", function (){
    var model = createModel().x(10).y(20);
    model.setState({});
    assert.equal(model.x(), 5);
    assert.equal(model.y(), 6);
  });

  it("should chain setState", function (){

    var model = createModel()
      .x(10)
      .y(20)
      .setState({y: 45});

    assert.equal(model.x(), 5);
    assert.equal(model.y(), 45);
  });

  it("should react", function (){
    var model = new ReactiveModel()
      .addPublicProperty("a", 5)
      .finalize();

    model.react({
      b: ["a", function (a){
        return a + 1;
      }]
    });

    ReactiveModel.digest();

    assert.equal(model.b(), 6);
  });

  it("should react and use newly set value", function (){
    var model = new ReactiveModel()
      .addPublicProperty("a", 5)
      .finalize();

    model.react({
      b: ["a", function (a){
        return a + 1;
      }]
    });

    model.a(7);
    ReactiveModel.digest();
    assert.equal(model.b(), 8);
  });

  //it("should track when values change", function (){
  //  var model = new ReactiveModel()
  //    .addPublicProperty("a", 5)
  //    .finalize();

  //  model.react({
  //    b: ["a", function (a){
  //      return a + 1;
  //    }]
  //  });

  //  model.a(7);
  //  ReactiveModel.digest();
  //  assert.equal(model.b(), 8);

  //  model.a(8);
  //  model.a(9);
  //  model.a(10);
  //  ReactiveModel.digest();
  //  assert.equal(model.b(), 11);
  //});


});
