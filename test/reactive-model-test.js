var tape = require("tape"),
    ReactiveModel = require("../lib/reactive-model");

tape("should work", function (test){
  test.equal(ReactiveModel, "test");
  test.end();
});
