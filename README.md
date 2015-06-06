# reactive-model

An unfinished library for building reactive models. This is an experiment that may be thrown away.

This is a re-design of [model.js](https://github.com/curran/model) that addresses the following issues:

 * The model.js syntax forces you to type each dependency property twice.
 * The model.js syntax does not encode the data dependency graph explicitly, it is expressed implicitly by setting model property values within reactive functions (`model.when` callbacks).
 * The execution model of model.js uses `setTimeout` to queue evaluation of every single edge in the data dependency graph. This can have a performance impact, and can lead to inconsistent system state while the dependency graph is being evaluated. Let's say `setTimeout` takes about 4 ms to resolve. This means it would take 4 * d ms to evaluate any full data dependency graph, where d is the number of hops required through the data dependency graph (there must be some graph theory term for this..).

The core ideas of this redesign are:

 * data dependency graphs are speficied explicitly (a lot like [Make](http://en.wikipedia.org/wiki/Make_%28software%29))
 * processing of changes is delayed until the next animation frame, so updates are synchronized with rendering
 * changes are processed (or "digested") using an explicit topological sort algorithm on the data dependency graph.

The reactive model maintains internally a graph data structure (the data dependency graph) in which

 * vertices may be either properties or reactive functions
 * edges represent a data dependency
<figure>
  <a href="http://bl.ocks.org/curran/5905182da50a4667dc00">
   <img src="http://curran.github.io/images/reactive-model/firstLastFlow.png" alt="Caption to image">
  </a>
  <figcaption style="text-align: center;">
    An example of a data dependency graph.
  </figcaption>
</figure>

These terms have a specific meaning within this project:

 * "reactive model" The result of `new ReactiveModel()`.
 * "reactive function" A callback function and metadata that describes its input and output properties. A representation of set of reactive functions is passed into `model.react`.
 * "reactive function callback" The callback function portion of a reactive function.
 * "digest" A cycle of the algorithm that evaluates the data dependency graph. This occurst at most once per animation frame.
 * "evaluate" A term to denote complete resolution of the data dependency graph. After the complete data dependency graph has been **evaluated** by a digest, the state of the model is consistent, and all reactive functions that are transitively dependent on any changed property have been executed in the proper order, with their output values assigned to model properties.

# usage
Aspirational, not yet implemented. Following [readme-driven development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html).

```javascript
var model = new ReactiveModel();

model.react({

  // The output property, assigned by reacting to input properties.
  fullName: [
  
    // A comma delimited list of input property names,
    // followed by the reactive function callback.
    "firstName", "lastName", function (d){
    
      // Following a popular convention from the D3 community,
      // "d" is used as the variable name for objects that contain many properties.
      // "d" contains values for each input property, in this case "firstName" and "lastName".
      
      // This function is only invoked if all input properties are defined.

      // Return the computed value for the output property, "fullName".
      return d.firstName + " " + d.lastName;
    }
  ]
});

// Setting properties like this queues a digest to occur at the next animation frame,
// where changed properties are propagated through the data dependency graph.
model.firstName = "Jane";
model.lastName = "Smith";

// Using requestAnimationFrame, we can queue this callback to run
// directly after the upcoming digest completes,
requestAnimationFrame(function (){

  // so here, we can expect that the dependency graph has been fully evaluated.
  expect(model.fullName).to.equal("John Smith");
});
```

## Asynchronous Reactive Runctions

For asynchronouos operations, the API supports returning a Promise from the reactive function. Here's an example that uses this API to fetch a CSV file using [d3.csv](https://github.com/mbostock/d3/wiki/CSV):

```javascript
var model = new ReactiveModel();

model.react({
  data: ["url", function (d){
    return new Promise(function (resolve, reject){
      d3.csv(d.url, function (error, data){
        if(error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  ]
});
```

When the data flow graph has reactive functions that use asynchronous operations, `requestAnimationFrame` is no longer a valid way to detect when the complete data dependency graph has been evaluated. This is because the asynchronous operation may take longer than a single animation frame to complete.

In this situation, you can use `model.set()`, which returns a Promise that is resolved only after the complete data dependency graph has been evaluated, including asynchronous reactive functions.

```javascript
model.set({
  url: "http://curran.github.io/data/iris/iris.csv"
}).then(function (){
  // At this point, model.data should be populated with parsed CSV data.
});
```
