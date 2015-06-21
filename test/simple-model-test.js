var SimpleModel = require("../reactive-model.js").SimpleModel;
var assert = require("assert");

describe("SimpleModel", function (){

  it("should implement on", function (done){
    var simpleModel = new SimpleModel();

    simpleModel.on("x", function (){
      assert.equal(simpleModel.get("x"), 5);
      done();
    });
    
    simpleModel.set("x", 5);
  });

//  it("should implement off", function (){
//    var simpleModel = new SimpleModel();
//    var counter = 0;
//
//    function callback(){
//      counter++;
//    }
//    
//    simpleModel.on("x", callback);
//    simpleModel.off("x", callback);
//    simpleModel.set("x", 5);
//
//    assert.equal(counter, 0);
//  });
});
