var ReactiveModel = require("./index");
var assert = require("assert");

var outputGraph = require("graph-diagrams")({

  // If true, writes graph files to ../graph-diagrams for visualization.
  outputGraphs: false,
  project: "reactive-model"
});

// Convenience function to output graphs for visualization.
function output(name){
  outputGraph(ReactiveModel.serializeGraph(), name);
}

function increment(x){
  return x + 1;
}

function add(a, b){
  return a + b;
}

describe("ReactiveModel", function (){

  describe("Adding public properties", function (){

    it("Should add a public property and get its value.", function (){
      var my = ReactiveModel();
      my("x", 5);
      assert.equal(my.x(), 5);
      my.destroy();
    });

    it("Should add a public property and set its value.", function (){
      var my = ReactiveModel();
      my("x", 5);
      my.x(10);
      assert.equal(my.x(), 10);
      my.destroy();
    });

    it("Should support chaining when setting multiple properties.", function (){
      var my = ReactiveModel()
        ("x", 5)
        ("y", 6);

      my.x(10).y(20);

      assert.equal(my.x(), 10);
      assert.equal(my.y(), 20);
      my.destroy();
    });

    it("Should chain addProperty.", function (){
      var my = ReactiveModel()("x", 5);
      assert.equal(my.x(), 5);
      my.destroy();
    });
  });

  describe("Adding properties", function (){

    it("Should add a property and get its value.", function (){
      var my = ReactiveModel();
      my("x", 5);
      assert.equal(my.x(), 5);
      my.destroy();
    });

    it("Should add a property with no default and set its value.", function (){
      var my = ReactiveModel();
      my("x");
      my.x(10);
      assert.equal(my.x(), 10);
      my.destroy();
    });

    it("Should support chaining when setting multiple properties.", function (){
      var my = ReactiveModel();
      my("x", 5);
      my("y", 6);

      my
        .x(10)
        .y(20);

      assert.equal(my.x(), 10);
      assert.equal(my.y(), 20);
      my.destroy();
    });

    it("Should chain addProperty.", function (){
      var my = ReactiveModel()
        ("x", 5)
        ("y", 400);
      assert.equal(my.x(), 5);
      assert.equal(my.y(), 400);
      my.destroy();
    });

  });

  describe("Accessing configuration", function (){

    it("Should get configuration.", function (){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose()
        .x(10)
        .y(20);

      ReactiveModel.digest();

      var configuration = my();
      assert.equal(Object.keys(configuration).length, 2);
      assert.equal(configuration.x, 10);
      assert.equal(configuration.y, 20);
      my.destroy();
    });

    it("Should get configuration and omit default values.", function (){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose();

      ReactiveModel.digest();

      var configuration = my();
      assert.equal(Object.keys(configuration).length, 0);
      my.destroy();
    });

    it("Should set configuration.", function (){

      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose();

      my({
        x: 20,
        y: 50
      });

      assert.equal(my.x(), 20);
      assert.equal(my.y(), 50);

      my.destroy();
    });

    it("Should chain setState.", function (){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose()
        ({ x: 20, y: 50 });
      assert.equal(my.x(), 20);
      assert.equal(my.y(), 50);
      my.destroy();
    });

    it("Should set configuration with default values for omitted properties.", function (){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose()
        .x(20)
        .y(50);

      assert.equal(my.x(), 20);
      assert.equal(my.y(), 50);

      my({});

      assert.equal(my.x(), 5);
      assert.equal(my.y(), 10);
      my.destroy();
    });

    it("Should set configuration with default values and new values.", function (){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose()
        .x(20)
        .y(50);

      assert.equal(my.x(), 20);
      assert.equal(my.y(), 50);

      my({ x: 30 });

      assert.equal(my.x(), 30);
      assert.equal(my.y(), 10);
      my.destroy();
    });

    it("Should listen for changes in configuration, getting default empty configuration.", function (done){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose();

      my.on(function (newState){
        assert.equal(Object.keys(newState).length, 0);
        my.destroy();
        done();
      });
    });

    it("Should listen for changes in configuration, getting configuration after one change.", function (done){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose();

      my.on(function (newState){
        assert.equal(Object.keys(newState).length, 1);
        assert.equal(newState.x, 15);
        done();
        my.destroy();
      });

      my.x(15);
    });

    it("Should listen for changes in configuration, getting configuration after two changes.", function (done){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose();

      my.on(function (newState){
        assert.equal(Object.keys(newState).length, 2);
        assert.equal(newState.x, 15);
        assert.equal(newState.y, 45);
        my.destroy();
        done();
      });

      my.x(15).y(45);
    });

    it("Should listen for changes in configuration, getting configuration after two async changes.", function (done){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("z", 10).expose();

      my.on(function (newState){
        if(my.z() === 10){
          assert.equal(Object.keys(newState).length, 1);
          assert.equal(newState.x, 15);
          my.z(45);
        } else {
          assert.equal(Object.keys(newState).length, 2);
          assert.equal(newState.z, 45);
          my.destroy();
          done();
        }
      });

      my.x(15);
    });

    it("Should stop listening for changes in configuration.", function (done){
      var my = ReactiveModel()
        ("x", 5).expose()
        ("y", 10).expose();
      var numInvocations = 0;

      var listener = my.on(function (newState){
        numInvocations++;
        if(my.x() === 5){
          my.x(50);
          my.off(listener);

          setTimeout(function (){
            assert.equal(numInvocations, 1);
            my.destroy();
            done();
          }, 10);
        }
      });
    });
  });

  describe("Reactive functions", function (){

    it("Should react.", function (){
      var my = ReactiveModel()("a", 5);
      my("b", increment, "a");
      ReactiveModel.digest();
      assert.equal(my.b(), 6);
      output("ab");
      my.destroy();
    });

    it("Should chain react.", function (){
      var my = ReactiveModel()
        ("a", 5)
        ("b", increment, "a");
      ReactiveModel.digest();
      assert.equal(my.b(), 6);
      my.destroy();
    });

    it("Should expose chainable digest() on instances.", function (){
      var my = ReactiveModel()
        ("a", 5)
        ("b", increment, "a")
        .digest();
      assert.equal(my.b(), 6);
      my.destroy();
    });

    it("Should react and use newly set value.", function (){
      var my = ReactiveModel()
        ("a", 5)
        ("b", increment, "a");
      my.a(10);
      ReactiveModel.digest();
      assert.equal(my.b(), 11);
      my.destroy();
    });

    it("Should react with two public input properties.", function (){
      var my = ReactiveModel()
        ("firstName", "Jane")
        ("lastName", "Smith")
        ("fullName", function (firstName, lastName){
          return firstName + " " + lastName;
        }, "firstName, lastName");
      ReactiveModel.digest();
      assert.equal(my.fullName(), "Jane Smith");
      output("full-name");
      my.destroy();
    });

    it("Should react with input properties defined in an array.", function (){
      var my = ReactiveModel()
        ("firstName", "Jane")
        ("lastName", "Smith")
        ("fullName", function (firstName, lastName){
          return firstName + " " + lastName;
        }, ["firstName", "lastName"]);
      ReactiveModel.digest();
      assert.equal(my.fullName(), "Jane Smith");
      my.destroy();
    });

    it("Should propagate two hops in a single digest.", function (){

      var my = ReactiveModel()
        ("a", 0)
        ("b", increment, "a")
        ("c", increment, "b");

      my.a(1);
      ReactiveModel.digest();

      assert.equal(my.a(), 1);
      assert.equal(my.b(), 2);
      assert.equal(my.c(), 3);

      output("abc");

      my.destroy();
    });

    it("Should evaluate not-too-tricky case.", function (){

      var my = ReactiveModel()
        ("a", 1)
        ("c", 2);

      // a - b
      //       \
      //        e
      //       /
      // c - d

      my
        ("b", increment, "a")
        ("d", increment, "c")
        ("e", add, "b, d");

      ReactiveModel.digest();

      assert.equal(my.e(), (1 + 1) + (2 + 1));

      output("not-too-tricky");

      my.destroy();
    });

    it("Should evaluate tricky case.", function (){

      //      a
      //     / \
      //    b   |
      //    |   d
      //    c   |
      //     \ /
      //      e   

      var my = ReactiveModel()
        ("a", 5)
        ("b", increment, "a")
        ("c", increment, "b")
        ("d", increment, "a")
        ("e", add, "b, d");

      ReactiveModel.digest();

      var a = my.a(),
          b = a + 1,
          c = b + 1,
          d = a + 1,
          e = b + d;

      assert.equal(my.e(), e);

      output("tricky-case");

      my.destroy();
    });

    it("Should evaluate trickier case.", function (){

      //       a
      //     / \ \
      //    b   | \
      //    |   e  \
      //    c   |  g
      //    |   f  /
      //    d   | /
      //     \ / /
      //       h   

      function add3(x, y, z){ return x + y + z; }

      var my = ReactiveModel()
        ("a", 5)
        ("b", increment, "a")
        ("c", increment, "b")
        ("d", increment, "c")
        ("e", increment, "a")
        ("f", increment, "e")
        ("g", increment, "a")
        ("h", add3, "d, f, g");

      ReactiveModel.digest();

      var a = my.a(),
          b = a + 1,
          c = b + 1,
          d = c + 1,
          e = a + 1,
          f = e + 1,
          g = a + 1,
          h = d + f + g;

      assert.equal(my.h(), h);

      output("trickier-case");

      my.destroy();
    });

    it("Should auto-digest.", function (done){
      var my = ReactiveModel()
        ("a", 5)
        ("b", increment, "a");

      setTimeout(function(){
        assert.equal(my.b(), 6);
        my.a(10);
        assert.equal(my.b(), 6);
        setTimeout(function(){
          assert.equal(my.b(), 11);
          my.destroy();
          done();
        });
      });
    });

    it("Should work with booleans.", function (){
      var my = ReactiveModel()
        ("a", 5);
      
      my("b", function (a){
        return !a;
      }, "a");

      my.a(false);
      ReactiveModel.digest();
      assert.equal(my.b(), true);

      my.a(true);
      ReactiveModel.digest();
      assert.equal(my.b(), false);
      my.destroy();
    });

    it("Should work with null as assigned value.", function (){
      var my = ReactiveModel()
        ("a", 5);

      my("b", function (a){
        if(a !== 5) return true;
      }, "a");

      my.a(null);

      ReactiveModel.digest();
      assert.equal(my.b(), true);
      my.destroy();
    });

    it("Should work with null as default value.", function (){
      var my = ReactiveModel()
        ("a", null);

      assert.equal(my.a(), null);

      my("b", function (a){
        return true;
      }, "a");

      ReactiveModel.digest();
      assert.equal(my.b(), true);
      my.destroy();
    });

    it("Should work with asynchronous case.", function (testDone){
      var my = new ReactiveModel()
        ("a", 5);

      // Similarly to mocha, if an extra "done" argument is on the function,
      // it is treated as an asynchronous function. The "done" callback should
      // be invoked asynchronously with the new value for the output property.
      my
        ("b", function (a, done){
          setTimeout(function (){
            done(a + 1);
          }, 20);
        }, "a")
        ("c", function (b){
          assert.equal(b, 2);
          my.destroy();
          testDone();
        }, "b");

      my.a(1);
    });

    it("Should work with asynchronous case that is not actually asynchronous.", function (testDone){
      var my = new ReactiveModel()
        ("a", 5);

      my
        ("b", function (a, done){

          // The "done" callback is being invoked synchronously.
          // This kind of code should not be written, but just in case people do it by accident,
          // the library is set up to have the expected behavior.
          done(a + 1);

        }, "a")
        ("c", function (b){
          assert.equal(b, 2);
          my.destroy();
          testDone();
        }, "b");

      my.a(1);
    });
    // TODO should throw an error if done() is called more than once.


    it("Should support reactive functions with no return value.", function(){
      var my = ReactiveModel()
        ("a", 5);

      var sideEffect;

      my(function (a){
        sideEffect = a + 1;
      }, "a");

      ReactiveModel.digest();
      assert.equal(sideEffect, 6);

      output("side-effect");
      
      my.destroy();
    });

    it("Should support no return value and multiple inputs.", function(){
      var my = ReactiveModel()
        ("a", 5)
        ("b", 50);

      var sideEffect;

      my(function (a, b){
        sideEffect = a + b;
      }, "a, b");

      ReactiveModel.digest();
      assert.equal(sideEffect, 55);

      output("side-effect-ab");
      
      my.destroy();
    });

    it("Should support no return value and multiple inputs defined as array.", function(){
      var my = ReactiveModel()
        ("a", 40)
        ("b", 60);

      var sideEffect;

      my(function (a, b){
        sideEffect = a + b;
      }, ["a", "b"]);

      ReactiveModel.digest();
      assert.equal(sideEffect, 100);
      my.destroy();
    });

    it("Should serialize the data flow graph.", function (){
      var my = ReactiveModel()
        ("firstName", "Jane")
        ("lastName", "Smith")
        ("fullName", function (firstName, lastName){
          return firstName + " " + lastName;
        }, "firstName, lastName");

      var serialized = ReactiveModel.serializeGraph();

      //console.log(JSON.stringify(serialized, null, 2));

      assert.equal(serialized.nodes.length, 3);
      assert.equal(serialized.links.length, 2);

      var idStart = 93;

      assert.equal(serialized.nodes[0].id, String(idStart));
      assert.equal(serialized.nodes[1].id, String(idStart + 1));
      assert.equal(serialized.nodes[2].id, String(idStart + 2));

      assert.equal(serialized.nodes[0].propertyName, "fullName");
      assert.equal(serialized.nodes[1].propertyName, "firstName");
      assert.equal(serialized.nodes[2].propertyName, "lastName");

      assert.equal(serialized.links[0].source, String(idStart + 1));
      assert.equal(serialized.links[0].target, String(idStart));
      assert.equal(serialized.links[1].source, String(idStart + 2));
      assert.equal(serialized.links[1].target, String(idStart));

      my.destroy();
    });

    it("Should support nested digest.", function (){
      var my = ReactiveModel()
        ("a", 5)
        ("b")
        ("c", function (b){
          return b / 2;
        }, "b")
        (function (a){
          for(var i = 0; i < a; i++){
            my.b(i);
            ReactiveModel.digest();
            assert.equal(my.c(), i / 2);
          }
        }, "a");
      ReactiveModel.digest();
    });

  });

  describe("Cleanup", function (){

    it("Should remove synchronous reactive function on destroy.", function (){
      var my = ReactiveModel()
        ("a", 5)
        ("b", increment, "a");

      my.a(10);
      ReactiveModel.digest();
      assert.equal(my.b(), 11);

      my.destroy();
      my.a(20);
      ReactiveModel.digest();
      assert.equal(my.b(), 11);
    });

    it("Should remove asynchronous reactive function on destroy.", function (done){
      var my = ReactiveModel()
        ("a", 5);

      my("b", function (a, done){
        setTimeout(function(){
          done(a + 1);
        }, 5);
      }, "a");

      my.a(10);
      ReactiveModel.digest();
      setTimeout(function(){
        assert.equal(my.b(), 11);
        my.destroy();
        my.a(20);

        setTimeout(function(){
          assert.equal(my.b(), 11);
          done();
        }, 10);

        assert.equal(my.b(), 11);
      }, 10);
    });

    it("Should remove property listeners on destroy.", function (){
      var my = ReactiveModel()("a", 50),
          a = my.a,
          numInvocations = 0;
      a.on(function (){ numInvocations++; });
      assert.equal(numInvocations, 1);

      my.destroy();

      a(5);
      assert.equal(numInvocations, 1);
    });
  });

  describe("model.link()", function (){
    it("Should link between models.", function (){
      var model1 = ReactiveModel()("someOutput", 5);
      var model2 = ReactiveModel()("someInput", 10);
      var link = ReactiveModel.link(model1.someOutput, model2.someInput);

      ReactiveModel.digest();
      assert.equal(model2.someInput(), 5);

      model1.someOutput(500);
      ReactiveModel.digest();
      assert.equal(model2.someInput(), 500);

      link.destroy();
    });
  });

  describe("model.call()", function (){

    it("Should support model.call().", function(){

      function mixin(my){
        my("a", 5)
          ("b", increment, "a");
      }

      var my = ReactiveModel()
        .call(mixin);

      ReactiveModel.digest();
      
      assert.equal(my.b(), 6);
    });

    it("Should support model.call() with 1 argument.", function(){

      function mixin(my, amount){
        my("a", 5)
          ("b", function (a){
            return a + amount;
          }, "a");
      }

      var my = ReactiveModel()
        .call(mixin, 2);

      ReactiveModel.digest();
      
      assert.equal(my.b(), 7);
    });

    it("Should support model.call() with 2 arguments.", function(){

      function mixin(my, amount, factor){
        my("a", 5)
          ("b", function (a){
            return (a + amount) * factor;
          }, "a");
      }

      var my = ReactiveModel()
        .call(mixin, 2, 3);

      ReactiveModel.digest();
      
      assert.equal(my.b(), 21);
    });
  });

  describe("Edge Cases and Error Handling", function (){

    it("Should throw error when input property is not defined.", function(){
      assert.throws(function (){
        ReactiveModel()(function (a){}, "a");
      }, /The property "a" was referenced as a dependency for a reactive function before it was defined. Please define each property first before referencing them in reactive functions./);
    });

    it("Should throw error when output property is already defined.", function(){
      assert.throws(function (){
        ReactiveModel()
          ("a", 5)
          ("a", function (a){}, "a");
      }, /The property "a" is already defined./);
    });

    it("Should throw error when newly added property is already defined.", function(){
      assert.throws(function (){
        ReactiveModel()
          ("b", 5)
          ("b", 15);
      }, /The property "b" is already defined./);
    });

  });
});
