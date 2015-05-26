var tape = require("tape"),
    ReactiveModel = require("../lib/reactive-model");

tape("react to single existing property", function (test){
  var model = new ReactiveModel();

  model.set({ x: "foo" });

  test.plan(1);
  model.react({
    testOutput: ["x", function (x) {
      test.equal(x, "foo");
    }]
  });
});


//tape("react to single added property", function (test){
//  var model = new ReactiveModel();
//
//  test.plan(1);
//  model.react({
//    testOutput: ["x", function (x) {
//      test.equal(x, "foo");
//    }]
//  });
//
//  model.set({ x: "foo" });
//});
