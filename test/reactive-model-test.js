require("source-map-support").install();

var ReactiveModelModules = require("../reactive-model.js");
var ReactiveModel = ReactiveModelModules.ReactiveModel;
var nextFrame = ReactiveModelModules.nextFrame;

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

  it("should evaluate the data dependency graph, property set before model.react", function (done){
    var model = new ReactiveModel();

    model.foo = 5;

    model.react({
      bar: ["foo", function (d){
        return d.foo + 1;
      }]
    });

    nextFrame(function (){
      assert.equal(model.foo, 5);
      assert.equal(model.bar, 6);
      done();
    });
  });

  it("should evaluate the data dependency graph, property set after model.react", function (done){
    var model = new ReactiveModel();

    model.react({
      bar: ["foo", function (d){
        return d.foo + 1;
      }]
    });

    model.foo = 5;

    nextFrame(function (){
      assert.equal(model.foo, 5);
      assert.equal(model.bar, 6);
      done();
    });
  });

  it("should evaluate the data dependency graph, using most recent value only", function (done){
    var model = new ReactiveModel();

    model.foo = 3;

    model.react({
      bar: ["foo", function (d){
        return d.foo + 1;
      }]
    });

    model.foo = 4;
    model.foo = 5;

    nextFrame(function (){
      assert.equal(model.foo, 5);
      assert.equal(model.bar, 6);
      done();
    });
  });

  it("should evaluate the data dependency graph with two input properties", function (done){

    var model = new ReactiveModel();

    model.react({
      fullName: [
        "firstName", "lastName", function (d){
          return d.firstName + " " + d.lastName;
        }
      ]
    });

    model.firstName = "Jane";
    model.lastName = "Smith";

    nextFrame(function (){
      assert.equal(model.fullName, "Jane Smith");
      done();
    });
  });

  it("should not evaluate reactive function when not all input properties are defined", function (done){

    var model = new ReactiveModel();
    var counter = 0;

    model.react({
      fullName: [
        "firstName", "lastName", function (d){
          counter++;
          return d.firstName + " " + d.lastName;
        }
      ]
    });

    model.firstName = "Jane";

    nextFrame(function (){
      assert.equal(counter, 0);
      done();
    });
  });
});
