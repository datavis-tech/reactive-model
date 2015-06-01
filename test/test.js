var ReactiveModel = require("../src/reactive-model.js");
var assert = require("assert");

describe("reactive-model", function (){

  it("should be a function", function (){
    assert.equal(typeof ReactiveModel, "function");
  });

  it("should enforce new", function (){
    var model1 = ReactiveModel();
    var model2 = new ReactiveModel();

    assert(model1 instanceof ReactiveModel);
    assert(model2 instanceof ReactiveModel);
  });
});

//var tape = require("tape"),
//    ReactiveModel = require("../lib/reactive-model");
//
//tape("react to single existing property", function (test){
//  var model = new ReactiveModel();
//
//  model.set({ x: "foo" });
//
//  test.plan(1);
//  model.react({
//    testOutput: ["x", function (x) {
//      test.equal(x, "foo");
//    }]
//  });
//});
//
//
////tape("react to single added property", function (test){
////  var model = new ReactiveModel();
////
////  test.plan(1);
////  model.react({
////    testOutput: ["x", function (x) {
////      test.equal(x, "foo");
////    }]
////  });
////
////  model.set({ x: "foo" });
////});
////
//
//var tape = require("tape"),
//    ReactiveModel = require("../lib/reactive-model");
//
//tape("set model properties", function (test){
//  var model = new ReactiveModel();
//  model.set({ x: "foo" });
//  test.equal(model.x, "foo");
//  test.end();
//});
//
//tape("set model property twice", function (test){
//  var model = new ReactiveModel();
//  model.set({ x: "foo" });
//  model.set({ x: "bar" });
//  test.equal(model.x, "bar");
//  test.end();
//});
//
//tape("set model property twice (variant A)", function (test){
//  var model = new ReactiveModel();
//  model.x = "foo";
//  model.set({ x: "bar" });
//  test.equal(model.x, "bar");
//  test.end();
//});
//
//tape("set model property twice (variant B)", function (test){
//  var model = new ReactiveModel();
//  model.set({ x: "foo" });
//  model.x = "bar";
//  test.equal(model.x, "bar");
//  test.end();
//});
