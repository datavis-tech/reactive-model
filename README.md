# reactive-model

An unfinished library for building reactive models. This is a weekend experiment that may be thrown away.

The core ideas of this are:

 * data dependency graphs can be speficied declaratively (a lot like [Make](http://en.wikipedia.org/wiki/Make_%28software%29))
 * processing of changes is delayed until the next animation frame
 * changes are processed using a topological sort algorithm

The reactive model maintains internally a graph data structure in which

 * vertices may be either properties or reactive functions
 * edges represent a data dependency

[![](http://curran.github.io/images/reactive-model/firstLastFlow.png)](http://bl.ocks.org/curran/5905182da50a4667dc00)

I am making up these terms:

 * "reactive function" the function passed into `model.react`
 * "reactive model" the result of `new ReactiveModel`

# usage
Aspirational, not yet implemented. Following [readme-driven development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html).

```javascript
var model = new ReactiveModel();

model.react({

  // The output property, assigned by reacting to input properties.
  fullName: [
  
    // A comma delimited list of input property names.
    "firstName, lastName",

    // The reactive function invoked with input property values.
    function (firstName, lastName){

      // Returns the value for the output property, "fullName".
      return firstName + " " + lastName;
    }
  ]
});

// Calling model.set returns a promise.
model.set({
  firstName: "John",
  lastName: "Smith"
}).then(function (){

  // The promise is fulfilled after changes are propagated.
  expect(model.fullName).to.equal("John Smith");
});
```

## asynchronous reactive functions

For asynchronouos operations, the API supports returning a Promise from the reactive function.

```javascript
var model = new ReactiveModel();

model.react({
  data: ["url", function (url){
    fetchTheDataAsynchronouslyAndReturnAPromise(url);
  ]
});

model.set({
  url: "http://www.google.com"
}).then(function (){
  // At this point, model.data should be populated.
});
```
