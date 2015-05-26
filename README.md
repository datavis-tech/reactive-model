# reactive-model

A library for building reactive models.

[![](http://curran.github.io/images/reactive-model/firstLastFlow.png)](http://bl.ocks.org/curran/5905182da50a4667dc00)

# usage

```javascript
var model = new ReactiveModel();

model.react({

  // The output property, assigned by reacting to input properties.
  fullName: [
  
    // A comma delimited list of input property names.
    "firstName, lastName",

    // The function invoked with input property values.
    function (firstName, lastName){

      // Returns the value for the output property, "fullName".
      return firstName + " " + lastName;
    }
  ]
});

model.set({
  firstName: "John",
  lastName: "Smith"
}).then(function (){
  expect(model.fullName).to.equal("John Smith");
  done();
});
```
