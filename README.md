# reactive-model

A library for reactive models.

## Example

<a href="http://bl.ocks.org/curran/5905182da50a4667dc00"> <img src="http://curran.github.io/images/reactive-model/firstLastFlow.png"> </a>

```javascript
var model = new ReactiveModel();

model.react({
  fullName: [
    "firstName", "lastName", function (firstName, lastName){
      return firstName + " " + lastName;
    }
  ]
});

model
  .firstName("Jane")
  .lastName("Smith");

ReactiveModel.digest();

// Prints "Jane Smith"
console.log(model.fullName());
```

## API Reference

<a name="reactive-model" href="#reactive-model">#</a> <b>new ReactiveModel</b>()

Constructs a new reactive function.

## Glossary of Terms

 * "reactive model" The result of `new ReactiveModel()`.
 * "reactive function" A callback function and metadata that describes its input and output properties. A representation of set of reactive functions is passed into `model.react`.
 * "reactive function callback" The callback function portion of a reactive function.
 * "digest" A cycle of the algorithm that evaluates the data dependency graph. This occurst at most once per animation frame.
 * "evaluate" A term to denote complete resolution of the data dependency graph. After the complete data dependency graph has been **evaluated** by a digest, the state of the model is consistent, and all reactive functions that are transitively dependent on any changed property have been executed in the proper order, with their output values assigned to model properties.

## Development Flow

This project uses [Rollup](https://github.com/rollup/rollup) for bundling ES6 modules into a CommonJS build. The unit tests use the bundle. To re-generate the bundle and run the unit tests, execute

`make test`

To list all source files, run

`make tree`

## Background

This is a re-design of [model.js](https://github.com/curran/model) that addresses the following issues:

 * The model.js syntax forces you to type each dependency property twice.
 * The model.js syntax does not encode the data dependency graph explicitly, it is expressed implicitly by setting model property values within reactive functions (`model.when` callbacks).
 * The execution model of model.js uses `setTimeout` to queue evaluation of every single edge in the data dependency graph. This can have a performance impact, and can lead to inconsistent system state while the dependency graph is being evaluated. Let's say `setTimeout` takes about 4 ms to resolve. This means it would take 4 * d ms to evaluate any full data dependency graph, where d is the number of hops required through the data dependency graph (there must be some graph theory term for this..).

The core ideas of this redesign are:

 * data dependency graphs are specified explicitly (a lot like [Make](http://en.wikipedia.org/wiki/Make_%28software%29))
 * processing of changes is delayed until the next animation frame, so updates are synchronized with rendering
 * changes are processed (or "digested") using an explicit topological sort algorithm on the data dependency graph.

See also [ZJONSSON/clues](https://github.com/ZJONSSON/clues), which is a very similar library.

## How it Works

This library maintains a graph data structure internally, called the "data dependency graph", in which

 * vertices represent either properties or reactive functions, and
 * edges represent a data dependency;

