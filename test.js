var ReactiveModel = require("./index");
var assert = require("assert");

function increment(x){
  return x + 1;
}

function add(a, b){
  return a + b;
}

describe("ReactiveModel", function (){

  it("Should add a public property and get its value.", function (){
    var model = ReactiveModel();
    model.addPublicProperty("x", 5);
    assert.equal(model.x(), 5);
  });

  it("Should add a public property and set its value.", function (){
    var model = ReactiveModel();
    model.addPublicProperty("x", 5);
    model.x(10);
    assert.equal(model.x(), 10);
  });

  it("Should support chaining when setting multiple properties.", function (){
    var model = ReactiveModel();
    model.addPublicProperty("x", 5);
    model.addPublicProperty("y", 6);

    model
      .x(10)
      .y(20);

    assert.equal(model.x(), 10);
    assert.equal(model.y(), 20);
  });

  it("Should chain addPublicProperty.", function (){
    var model = ReactiveModel()
      .addPublicProperty("x", 5)
    assert.equal(model.x(), 5);
  });

  it("Should get state.", function (){
    var model = ReactiveModel()
      .addPublicProperty("x", 5)
      .addPublicProperty("y", 10)
      .x(10)
      .y(20);

    var state = model.getState();
    assert.equal(Object.keys(state).length, 2);
    assert.equal(state.x, 10);
    assert.equal(state.y, 20);
  });

  it("Should get state and omit default values.", function (){
    var model = ReactiveModel()
      .addPublicProperty("x", 5)
      .addPublicProperty("y", 10);

    var state = model.getState();
    assert.equal(Object.keys(state).length, 0);
  });

  it("Should set state.", function (){

    var model = ReactiveModel()
      .addPublicProperty("x", 5)
      .addPublicProperty("y", 10);

    model.setState({
      x: 20,
      y: 50
    });

    assert.equal(model.x(), 20);
    assert.equal(model.y(), 50);

  });

  it("Should chain setState.", function (){
    var model = ReactiveModel()
      .addPublicProperty("x", 5)
      .addPublicProperty("y", 10)
      .setState({ x: 20, y: 50 });
    assert.equal(model.x(), 20);
    assert.equal(model.y(), 50);
  });

  it("Should set state with default values for omitted properties.", function (){
    var model = ReactiveModel()
      .addPublicProperty("x", 5)
      .addPublicProperty("y", 10)
      .x(20)
      .y(50);

    assert.equal(model.x(), 20);
    assert.equal(model.y(), 50);

    model.setState({});

    assert.equal(model.x(), 5);
    assert.equal(model.y(), 10);
  });

  it("Should set state with default values and new values.", function (){
    var model = ReactiveModel()
      .addPublicProperty("x", 5)
      .addPublicProperty("y", 10)
      .x(20)
      .y(50);

    assert.equal(model.x(), 20);
    assert.equal(model.y(), 50);

    model.setState({ x: 30 });

    assert.equal(model.x(), 30);
    assert.equal(model.y(), 10);
  });

  it("Should throw an error when attempting to add a public property after getState.", function (){
    var model = ReactiveModel();
    model.addPublicProperty("x", 5);
    model.getState();
    assert.throws(model.addPublicProperty, Error);
  });

  it("Should throw an error when attempting to add a public property after setState.", function (){
    var model = ReactiveModel();
    model.addPublicProperty("x", 5);
    model.setState({ x: 20});
    assert.throws(model.addPublicProperty, Error);
  });

  it("Should react.", function (){
    var model = ReactiveModel()
      .addPublicProperty("a", 5);

    model({
      b: [function (a){
        return a + 1;
      }, "a"]
    });

    ReactiveModel.digest();

    assert.equal(model.b(), 6);
  });

  it("Should react and use newly set value.", function (){
    var model = ReactiveModel()
      .addPublicProperty("a", 5);

    model({
      b: [function (a){
        return a + 1;
      }, "a"]
    });

    model.a(10);

    ReactiveModel.digest();

    assert.equal(model.b(), 11);
  });

  it("Should react with two public input properties.", function (){
    var model = ReactiveModel()
      .addPublicProperty("firstName", "Jane")
      .addPublicProperty("lastName", "Smith");

    model({
      fullName: [function (firstName, lastName){
        return firstName + " " + lastName;
      }, "firstName, lastName"]
    });

    ReactiveModel.digest();

    assert.equal(model.fullName(), "Jane Smith");

  });

  it("should propagate two hops in a single digest", function (){

    var model = ReactiveModel()
      .addPublicProperty("a", 0);

    model({
      b: [increment, "a"],
      c: [increment, "b"]
    });

    model.a(1);
    ReactiveModel.digest();

    assert.equal(model.a(), 1);
    assert.equal(model.b(), 2);
    assert.equal(model.c(), 3);
  });

  it("Should evaluate tricky case.", function (){

    var model = ReactiveModel()
      .addPublicProperty("a", 1)
      .addPublicProperty("c", 2);

    // a - b
    //       \
    //        e
    //       /
    // c - d

    model({
      b: [increment, "a"],
      d: [increment, "c"],
      e: [add, "b, d"]
    });

    ReactiveModel.digest();

    assert.equal(model.e(), (1 + 1) + (2 + 1));
  });

  it("Should auto-digest.", function (done){
    var model = ReactiveModel()
      .addPublicProperty("a", 5);

    model({
      b: [function (a){
        return a + 1;
      }, "a"]
    });

    setTimeout(function(){
      assert.equal(model.b(), 6);
      model.a(10);
      assert.equal(model.b(), 6);
      setTimeout(function(){
        assert.equal(model.b(), 11);
        done();
      });
    });
  });

  it("should work with booleans", function (){
    var model = ReactiveModel()
      .addPublicProperty("a", 5);

    model({
      b: [function (a){
        return !a;
      }, "a"]
    });

    model.a(false);
    ReactiveModel.digest();
    assert.equal(model.b(), true);

    model.a(true);
    ReactiveModel.digest();
    assert.equal(model.b(), false);
  });

  it("Should work with asynchronous case.", function (done){
    var model = new ReactiveModel()
      .addPublicProperty("a", 5);

    model({
      b: [function (a){
        setTimeout(function (){
          model.b(a + 1);
        }, 10);
      }, "a"],
      c: [function (b){
        assert.equal(b, 2);
        done();
      }, "b"]
    });

    model.a(1);
  });
  // TODO dependencies that are not defined as public properties or outputs.
  // TODO destroy
});
