# reactive-model

An unfinished library for building reactive models. This is an experiment that may be thrown away.

This is a re-design of [model.js](https://github.com/curran/model) that addresses the following issues:

 * The model.js syntax forces you to type each dependency property twice.
 * The model.js syntax does not encode the data dependency graph explicitly, it is expressed implicitly by setting model property values within model.when callbacks.
 * The execution model of model.js uses setTimeout for every single edge in the data dependency graph. This can have a performance impact. Let's say setTimeout takes 4 ms to resolve. This means it would take 4 * d ms where d is the number of hops required through the data dependency graph.

The core ideas of this redesign are:

 * data dependency graphs can be speficied explicitly (a lot like [Make](http://en.wikipedia.org/wiki/Make_%28software%29))
 * processing of changes is delayed until the next animation frame, so updates are synchronized with rendering
 * changes are processed using a topological sort algorithm

The reactive model maintains internally a graph data structure in which

 * vertices may be either properties or reactive functions
 * edges represent a data dependency

[![](http://curran.github.io/images/reactive-model/firstLastFlow.png)](http://bl.ocks.org/curran/5905182da50a4667dc00)

I am making up these terms:

 * "reactive function" a function and metadata that describes its inputs and outputs. A set of reactive functions is passed into `model.react`.
 * "reactive model" the result of `new ReactiveModel`

# usage
Aspirational, not yet implemented. Following [readme-driven development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html).

```javascript
var model = new ReactiveModel();

model.react({

  // The output property, assigned by reacting to input properties.
  fullName: [
  
    // A comma delimited list of input property names.
    "firstName, lastName", function (d){

      // Returns the value for the output property, "fullName".
      return d.firstName + " " + d.lastName;
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

## Asynchronous reactive functions

For asynchronouos operations, the API supports returning a Promise from the reactive function.

```javascript
var model = new ReactiveModel();

model.react({
  data: ["url", function (d){
    return fetchTheDataAsynchronouslyAndReturnAPromise(d.url);
  ]
});

model.set({
  url: "http://www.google.com"
}).then(function (){
  // At this point, model.data should be populated.
});
```
