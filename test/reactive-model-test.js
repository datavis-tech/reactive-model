var ReactiveModel = require("../reactive-model.js");
var assert = require("assert");
require("source-map-support").install();

function increment(x){
  return x + 1;
}

function add(a, b){
  return a + b;
}

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

  it("should track when values change", function (){
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

    model.a(8);
    model.a(9);
    model.a(10);
    ReactiveModel.digest();
    assert.equal(model.b(), 11);
  });

  it("should react with two input properties", function (){

    var model = new ReactiveModel();

    model.react({
      fullName: ["firstName", "lastName", function (firstName, lastName){
        return firstName + " " + lastName;
      }]
    });

    model
      .firstName("Jane")
      .lastName("Smith");

    ReactiveModel.digest();

    assert.equal(model.fullName(), "Jane Smith");
  });

  it("should not react when only one of two input properties is defined", function (){
    var model = new ReactiveModel();
    var counter = 0;

    model.react({
      fullName: ["firstName", "lastName", function (firstName, lastName){
        counter++;
        return firstName + " " + lastName;
      }]
    });

    model.firstName("Jane");

    ReactiveModel.digest();

    assert.equal(counter, 0);
    assert.equal(model.fullName(), undefined);
  });

  it("should propagate two hops in a single digest", function (){

    var model = new ReactiveModel();

    model.react({
      b: ["a", increment],
      c: ["b", increment]
    });

    model.a(1);
    ReactiveModel.digest();

    assert.equal(model.a(), 1);
    assert.equal(model.b(), 2);
    assert.equal(model.c(), 3);
  });
  
  it("should evaluate digests independently", function (){
    var model = new ReactiveModel();

    var counterFullName = 0;
    var counterB = 0;

    model.react({
      fullName: ["firstName", "lastName", function (firstName, lastName){
        counterFullName++;
        return firstName + " " + lastName;
      }],
      b: ["a", function (a){
        counterB++;
        return a + 1;
      }]
    });

    model.firstName("John");
    model.lastName("Doe");
    ReactiveModel.digest();

    assert.equal(counterFullName, 1);
    assert.equal(counterB, 0);
    assert.equal(model.fullName(), "John Doe");

    model.a(1);
    ReactiveModel.digest();

    assert.equal(counterFullName, 1);
    assert.equal(counterB, 1);
    assert.equal(model.a(), 1);
    assert.equal(model.b(), 2);
    assert.equal(model.fullName(), "John Doe");
  });

  it("should evaluate tricky case", function (){

    var model = new ReactiveModel();

    // a - b
    //       \
    //        e
    //       /
    // c - d

    model.react({
      b: ["a", increment],
      d: ["c", increment],
      e: ["b", "d", add]
    });

    model.a(1).c(2);

    ReactiveModel.digest();

    assert.equal(model.e(), (1 + 1) + (2 + 1));
  });
});
