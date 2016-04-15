# ReactiveModel

A library for authoring data flow components. [![NPM](https://nodei.co/npm/reactive-model.png?mini=true)](https://npmjs.org/package/reactive-model) [![Build Status](https://travis-ci.org/curran/reactive-model.svg)](https://travis-ci.org/curran/reactive-model)

![reactivemodel stack](https://cloud.githubusercontent.com/assets/68416/14556258/e8c2ebaa-0314-11e6-813a-f8820675f489.png)

See also [ReactiveProperty](https://github.com/curran/reactive-property), [ReactiveFunction](https://github.com/curran/reactive-function), [GraphDataStructure](https://github.com/curran/graph-data-structure), [D3](d3js.org), [React](https://facebook.github.io/react/).

## Installation
You can include the library in your HTML like this:

```html
<script src="//curran.github.io/reactive-model/reactive-model-v0.6.0.min.js"></script>
```

Browser builds (UMD bundles) are published in the [gh-pages branch](https://github.com/curran/reactive-model/tree/gh-pages).

If you are using [NPM](https://www.npmjs.com/package/reactive-model), install with `npm install reactive-model`, then require the module in your code like this:

```javascript
var ReactiveModel = require("reactive-model");
```

## Examples

This example code computes `fullName` from `firstName` and `lastName`, demonstrating the basic functionality of the library:

 * creating a reactive model,
 * adding properties,
 * settin up a reactive function,
 * setting and getting property values,
 * and invoking `digest()`.

<p align="center">
  <a href="http://bl.ocks.org/curran/5905182da50a4667dc00">
    <img src="http://curran.github.io/images/reactive-model/firstLastFlow.png">
  </a>
  <br>
  <small>A visual representation of the data flow graph constructed in this example.</small>
</p>

```javascript

// Construct a new ReactiveModel instance.
var my = ReactiveModel();

// Add two properties to the model.
my.addProperties({
  firstName: "Jane",
  lastName: "Smith"
});

// Set up a reactive function that computes fullName.
my("fullName", function (firstName, lastName){
  return firstName + " " + lastName;
}, "firstName, lastName");

// Invoke digest() to propagate the changes synchronously.
// This is automatically invoked on the next animation frame after any changes,
// but we invoke it here so we can immediately access my.fullName();
ReactiveModel.digest();

// Access the computed property value.
console.log(my.fullName()); // Prints "Jane Smith"

// Set new values for firstName and lastName.
my
  .firstName("John")
  .lastName("Doe");

ReactiveModel.digest();

console.log(my.fullName()); // Prints "John Doe"
```

Here's a [complete working example](http://bl.ocks.org/curran/b45cf8933cc018cf5bfd4296af97b25f) that extends the above example code to interact with DOM elements.

<table>
  <tr>
    <td>
      Full Name<br>
      <a href="http://bl.ocks.org/curran/974c9def890f8ac0172611921fb51b8a">
        <img src="http://bl.ocks.org/curran/raw/974c9def890f8ac0172611921fb51b8a/thumbnail.png">
      </a>
    </td>
    <td>
      Responding to Resize <br>
      <a href="http://bl.ocks.org/curran/b45cf8933cc018cf5bfd4296af97b25f">
        <img src="http://bl.ocks.org/curran/raw/b45cf8933cc018cf5bfd4296af97b25f/thumbnail.png">
      </a>
    </td>
  </tr>
</table>

## API Reference

Constructing & Evaluating Data Dependency Graphs

 * [ReactiveModel()](#reactive-model-constructor)
 * [model(options)](#react)
 * [ReactiveModel.digest()](#digest)
 * [reactive-properties](#reactive-properties)

Serialization & Deserialization

 * [model.addPublicProperty(property, defaultValue)](#add-public-property)
 * [model.state()](#get-state)
 * [model.state(newState)](#set-state)
 * [model.state.on(function (newState){})](#on-state)

### Constructing & Evaluating Data Dependency Graphs

<a name="reactive-model-constructor" href="#reactive-model-constructor">#</a> <b>ReactiveModel</b>()

Constructs a new reactive model.

Example use:

```javascript
var model = ReactiveModel();
```

<a name="react" href="#react">#</a> <i>model</i>(<i>outputPropertyName, callback, inputsStr</i>)

Adds the given reactive function to the data dependency graph. The motivation behind setting it up this way is:

 * The dependencies could be inferred from the argument names of the callback, but this approach would break under minification (since argument names may be changed). Therefore, an explicit representation of the list of property names in string literal form is required.
 * A comma-delimited list was chosen as the representation because one can copy-and-paste the arguments list of the callback directly and simply add quotes around it. From the perspective of developers, this is more convenient than the array-of-strings approach taken by Model.js in representing dependencies.
 * The dependencies list is the second argument so it does not make the first line of the expression very long. With Model.js, the dependencies list comes first, followed by the callback, so the repetition of dependencies falls on the same line. With the dependencies list as the second argument, it fits nicely onto its own line after the definition of the callback function.

Here is an example invocation that sets the `b` property to be `a + 1` whenever `a` changes:

```javascript
model("b", function (a){
  return a + 1;
}, "a");
```

The reactive function callback is invoked with the values of input properties during a [digest](#digest).

After setting up the reactive function like this, the callback is invoked in the next digest if all of its input properties are defined. If not all of its input properties are defined, then it will not be invoked in the next digest. When any input properties change, the reactive function callback will be invoked in the next digest after the change (only if all inputs are defined).

The return value from the callback is assigned to the output property during a digest. The output of one reactive function may be used as an input to other reactive functions. This is how you can construct complex data flow graphs. Note that during each digest, changes are propagated through the dependency graph synchronously, within a single tick of the event loop.

Here's an example that assign `b = a + 1` and `c = b + 1`:

```javascript
function increment(x){
  return x + 1;
}

model
  ("b", increment, "a")
  ("c", increment, "b");
```

In this example, if `a` is assigned to the value 1 and a digest occurs, the value of `c` after the digest will be 3.

Asynchronous reactive functions are supported using an additional argument, the `done` callback, which should be called asynchronously with the new value for the output property. This is inspired by the [asynchronous tests in Mocha](https://mochajs.org/#asynchronous-code). Here's an asynchronous example:

```javascript
model("b", function (a, done){
  setTimeout(function (){
    done(a + 1);
  }, 500);
}, "a");
```

<a name="digest" href="#digest">#</a> <i>ReactiveModel</i>.<b>digest</b>()

Synchronously evaluates the data dependency graph.

This function is exposed on the `ReactiveModel` constructor function rather than the `ReactiveModel` instance because there is a singleton data dependency graph shared by all reactive model instances. This approach was taken to enable reactive functions that take input from one model and yield output on another (via [bind](#bind)).

The term "digest" was chosen because it is already in common use within the AngularJS community and refers to almost exactly the same operation - see [AngularJS $digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest).

<a name="reactive-properties" href="#reactive-properties">#</a> reactive-properties

Every property is made available on the model object as a [chainable getter-setter function](http://bost.ocks.org/mike/chart/#reconfiguration). These properties are instances of another module, [reactive-property](https://github.com/curran/reactive-property).

For example, assuming there is a [public property](#add-public-property) `a`, we can set its value like this:

```javascript
model.a(5);
```

The value can then be retreived by invoking the function with no arguments:

```javascript
model.a(); // returns 5
```

When the setter form is used, the `model` object is returned. This enables method chaining. For example, assuming there are tracked properties `a`, `b`, and `c`, their values can be set like this:

```javascript
model.a(3).b(4).c(5);
```

Whenever any public property used as an input to a reactive function is set, the [`digest()`](#digest) function is automatically scheduled to be invoked on the next tick.

### Serialization & Deserialization

<a name="add-public-property" href="#add-public-property">#</a> <i>model</i>.<b>addPublicProperty</b>(<i>property</i>, <i>defaultValue</i>)

Adds a public property with the given default value.

Returns the `model` object, so is chainable, like this:

```javascript
var model = new ReactiveModel()
  .addPublicProperty("x", 5)
  .addPublicProperty("y", 6);
```

Public properties may not be added after the `state` accessor has been accessed. This is to guarantee predictable serialization and deserialization behavior.

<a name="get-state" href="#get-state">#</a> <i>model</i>.<b>state</b>()

Returns a serialized form of the model that can later be passed as `newState` into `state(newState)`. This is an object that only contains public properties that have values other than their defaults.

<a name="set-state" href="#set-state">#</a> <i>model</i>.<b>state</b>(<i>newState</i>)

Sets the state of the model from its serialized form. The `newState` argument object is expected to contain values for public properties that have values other than their defaults. Public properties not included in `newState` will be set to their default values. Properties not previously added as public properties may not be included in the `newState` object.

Internally, `state(newState)` sets public properties to the specified values via their reactive-properties, causing the changes to be propagated through all reactive functions that depend on them.

<a name="on-state" href="#on-state">#</a> <i>model.state</i>.<b>on</b>(<i>function(newState){ ... }</i>)

This method can be used to listen for changes in state.

## Glossary

 * "reactive model" The result of `new ReactiveModel()`.
 * "reactive function" A callback function and metadata that describes its input and output properties. A representation of set of reactive functions is passed into `model.react`. Any reactive function has:
   * input properties
   * output properties
   * callback(input values) -> output value (the "reactive function callback")
 * "digest" An execution of the algorithm that evaluates the data dependency graph.
 * "evaluate" A term to denote complete resolution of the data dependency graph. After the complete data dependency graph has been **evaluated** by a digest, the state of the model is consistent with regard to its reactive functions, and all reactive functions that are transitively dependent on any changed property have been executed in the proper order, with their output values assigned to model properties.

## Development Flow

Run `npm test` to run the unit tests.

## How it Works

This library maintains an instance of [graph-data-structure](https://github.com/curran/graph-data-structure) internally, called the "data dependency graph", in which

 * vertices represent reactive properties, and
 * edges represent dependencies.

Whenever reactive functions are added to the model, nodes and edges are added to this data structure. Whenever a property is changed, that property is marked as changed.

The digest algorithm performs a topological sort using the changed property nodes as sources. The resulting list of nodes is in the sorted order in which the reactive functions must be executed. After computing this ordering, each reactive function is executed, and its output value is assigned to its output property. Before executing each reactive function, a check is performed that ensures all of its input properties are defined.

## Background

This is a re-design of [model.js](https://github.com/curran/model) that addresses the following issues:

 * The model.js syntax does not encode the data dependency graph explicitly, it is expressed implicitly by setting model property values within reactive functions (`model.when` callbacks).
 * The execution model of model.js uses `setTimeout` to queue evaluation of every single edge in the data dependency graph. This can have a performance impact, and can lead to inconsistent system state while the dependency graph is being evaluated. Let's say `setTimeout` takes about 4 ms to resolve. This means it would take 4 * d ms to evaluate any full data dependency graph, where d is the number of hops required through the data dependency graph.

The core ideas of this redesign are:

 * data dependency graphs are specified explicitly (a lot like [Make](http://en.wikipedia.org/wiki/Make_%28software%29))
 * changes are digested using an explicit topological sort algorithm on the data dependency graph
 * digests are synchronous (avoiding poor performance and inconsistent system state)
 * processing of changes is delayed until the next animation frame, so updates are synchronized with rendering

The state-related functions (addPublicProperty, state) were informed by work on the [Chiasm project](https://github.com/curran/chiasm/). Chiasm manages synchronization of interactive visualizations with a dynamic application state configuration. In order to achieve predictable behavior, Chiasm introduces the notion of "public properties" and the requirement that they have default values. This is essential to achieve the goal of reversability for every action resulting from configuration changes (required to support undo/redo and history navigation, one of the goals of the Chiasm project).

Moving the publicProperty and serialization/deserialization semantics into the model abstraction seemed like a logical move. This will simplify the implementation of an engine like Chiasm, and will provide consistent serialization behavior for any users of reactive-model.

### Not Yet Implemented

<a name="bind" href="#bind">#</a> <i>bind</i>(<i>arr</i>)

Establish bidirectional data binding between properties from different models.

The `arr` argument is expected to be an array of objects with the following properties:

 * `model` A reference to an instance of `ReactiveModel`.
 * `property` A property name on that model.

Invoking `bind()` adds a cycle of pass-through reactive functions to the data dependency graph such that all specified properties will be synchronized, handling the fact that they are from different model instances.

## Related Work

 * [ZJONSSON/clues](https://github.com/ZJONSSON/clues) A very similar library based on Promises.
 * [AngularJS Dependency Injection](https://docs.angularjs.org/guide/di) Inspired the API for reactive functions.
 * [AngularJS $digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest) Inspired the "digest" term.
 * [AMD](http://requirejs.org/docs/whyamd.html#amd) Also inspired the API for reactive functions.
 * [Notes on Graph Algorithms Used in Optimizing Compilers](http://www.cs.umb.edu/~offner/files/flow_graph.pdf) Algorithms for flow graph analysis.
 * [d3-scale](https://github.com/d3/d3-scale) Inspired documentation style.
 * [d3-bundler](https://github.com/d3/d3-bundler) Inspired approach for bundling with [Rollup](https://github.com/rollup/rollup).
