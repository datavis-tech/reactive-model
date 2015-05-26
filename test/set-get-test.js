var tape = require("tape"),
    ReactiveModel = require("../lib/reactive-model");

tape("set model properties", function (test){
  var model = new ReactiveModel();
  model.set({ x: "foo" });
  test.equal(model.x, "foo");
  test.end();
});

tape("set model property twice", function (test){
  var model = new ReactiveModel();
  model.set({ x: "foo" });
  model.set({ x: "bar" });
  test.equal(model.x, "bar");
  test.end();
});

tape("set model property twice (variant A)", function (test){
  var model = new ReactiveModel();
  model.x = "foo";
  model.set({ x: "bar" });
  test.equal(model.x, "bar");
  test.end();
});

tape("set model property twice (variant B)", function (test){
  var model = new ReactiveModel();
  model.set({ x: "foo" });
  model.x = "bar";
  test.equal(model.x, "bar");
  test.end();
});
