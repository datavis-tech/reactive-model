var SimpleModel = require("../reactive-model.js").SimpleModel;
var assert = require("assert");

describe("SimpleModel", function (){

  it("should implement model.on", function (done){
    var simpleModel = new SimpleModel();

    simpleModel.on("x", function (){
      assert.equal(simpleModel.get("x"), 5);
      done();
    });
    
    simpleModel.set("x", 5);
  });
});
