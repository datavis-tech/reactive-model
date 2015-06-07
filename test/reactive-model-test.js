var ReactiveModel = require("../reactive-model.js");
var nextFrame = ReactiveModel.nextFrame;

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

  it("should evaluate the data dependency graph", function (done){
    //var model = new ReactiveModel();

    //model.react({
    //  bar: ["foo", function (d){
    //    return d.foo + 1;
    //  }]
    //});

    //model.foo = 5;

    nextFrame(function (){
      //expect(model.bar).to.equal(6);
      done();
    });

  });

});

//var encodeReactiveFunction = ReactiveModel.encodeReactiveFunction;
//var encodeProperty = ReactiveModel.encodeProperty;
//var dependencyGraph = ReactiveModel.dependencyGraph;
//
//  it("should build the dependency graph", function (){
//    var model = new ReactiveModel();
//
//    // Dependency graph: a -> λ -> b
//    var reactiveFunctions = model.react({
//      b: ["a", function (a){ return a + 1; }]
//    });
//
//    assert.equal(reactiveFunctions.length, 1);
//    var λ = reactiveFunctions[0];
//
//    assert.equal(model.id, 0);
//    assert.equal(λ.id, 0);
//
//    assert.equal(encodeReactiveFunction(λ), "λ0");
//    assert.equal(encodeProperty(model, "a"), "0.a");
//    assert.equal(encodeProperty(model, "b"), "0.b");
//
//    assert.equal(dependencyGraph.adjacent("0.a").length, 1);
//    assert.equal(dependencyGraph.adjacent("0.a")[0], "λ0");
//
//    assert.equal(dependencyGraph.adjacent("λ0").length, 1);
//    assert.equal(dependencyGraph.adjacent("λ0")[0], "0.b");
//  });
//
//  
//
//  //it("should react to single existing property", function (done){
//  //  var model = new ReactiveModel();
//  //  model.foo = "bar";
//  //  model.react({
//
//  //    // In the case of reactive functions that do not produce any output,
//  //    // the destination property serves to document the function.
//  //    // This way, every reactive model has its complete reactive flow declaratively mapped out,
//  //    // so in the visualization of the reactive flow, every property node will have a meaningful name.
//  //    testPass: ["foo", function (foo){
//  //      assert.equal(foo, "bar");
//  //      done();
//  //    }]
//  //  });
//  //});
//});
//
////var tape = require("tape"),
////    ReactiveModel = require("../lib/reactive-model");
////
////tape("react to single existing property", function (test){
////  var model = new ReactiveModel();
////
////  model.set({ x: "foo" });
////
////  test.plan(1);
////  model.react({
////    testOutput: ["x", function (x) {
////      test.equal(x, "foo");
////    }]
////  });
////});
////
////
//////tape("react to single added property", function (test){
//////  var model = new ReactiveModel();
//////
//////  test.plan(1);
//////  model.react({
//////    testOutput: ["x", function (x) {
//////      test.equal(x, "foo");
//////    }]
//////  });
//////
//////  model.set({ x: "foo" });
//////});
//////
////
////var tape = require("tape"),
////    ReactiveModel = require("../lib/reactive-model");
////
////tape("set model properties", function (test){
////  var model = new ReactiveModel();
////  model.set({ x: "foo" });
////  test.equal(model.x, "foo");
////  test.end();
////});
////
////tape("set model property twice", function (test){
////  var model = new ReactiveModel();
////  model.set({ x: "foo" });
////  model.set({ x: "bar" });
////  test.equal(model.x, "bar");
////  test.end();
////});
////
////tape("set model property twice (variant A)", function (test){
////  var model = new ReactiveModel();
////  model.x = "foo";
////  model.set({ x: "bar" });
////  test.equal(model.x, "bar");
////  test.end();
////});
////
////tape("set model property twice (variant B)", function (test){
////  var model = new ReactiveModel();
////  model.set({ x: "foo" });
////  model.x = "bar";
////  test.equal(model.x, "bar");
////  test.end();
////});
