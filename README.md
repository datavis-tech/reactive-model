# reactive-model

A JavaScript library for [dataflow programming](https://en.wikipedia.org/wiki/Dataflow_programming).

[![NPM](https://nodei.co/npm/reactive-model.png)](https://npmjs.org/package/reactive-model)
[![NPM](https://nodei.co/npm-dl/reactive-model.png?months=3)](https://npmjs.org/package/reactive-model)
[![Build Status](https://travis-ci.org/datavis-tech/reactive-model.svg?branch=master)](https://travis-ci.org/datavis-tech/reactive-model)

This library provides an abstraction for **reactive data flows**. This means you can define so-called "reactive functions" in terms of their inputs and output, and the library will take care of executing these functions in the correct order. When input properties change, those changes are propagated through the data flow graph based on [topological sorting](https://en.wikipedia.org/wiki/Topological_sorting).

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15452883/b7100114-201b-11e6-8582-028465ed91cd.png">
  <br>
  The reactive-model stack for interactive data visualizations.
  <br>
  <a href="https://github.com/datavis-tech/reactive-property">reactive-property</a> |
  <a href="https://github.com/datavis-tech/graph-data-structure">graph-data-structure</a> |
  <a href="https://github.com/datavis-tech/reactive-function">reactive-function</a> |
  <a href="https://d3js.org/">D3</a>
</p>

**Table of Contents**

 * [Examples](#examples)
   * [AB](#ab)
   * [ABC](#abc)
   * [CDE](#cde)
   * [Full Name](#full-name)
   * [Tricky Case](#tricky-case)
 * [Installing](#installing)
 * [API Reference](#api-reference)
   * [Creating Reactive Models](#creating-reactive-models)
   * [Properties](#properties)
   * [Data Flow](#data-flow)
   * [Configuration](#configuration)

## Examples

<table>
  <tr>
    <td>
      Full Name Greeting<br>
      <a href="http://bl.ocks.org/curran/b45cf8933cc018cf5bfd4296af97b25f">
        <img src="http://bl.ocks.org/curran/raw/b45cf8933cc018cf5bfd4296af97b25f/thumbnail.png">
      </a>
    </td>
    <td>
      Responding to Resize<br>
      <a href="http://bl.ocks.org/curran/974c9def890f8ac0172611921fb51b8a">
        <img src="http://bl.ocks.org/curran/raw/974c9def890f8ac0172611921fb51b8a/thumbnail.png">
      </a>
    </td>
    <td>
      Margin Convention<br>
      <a href="http://bl.ocks.org/curran/b8e76dd7003538975b3e81e86ac6dd1e">
        <img src="https://gist.githubusercontent.com/curran/b8e76dd7003538975b3e81e86ac6dd1e/raw/877922b6ee43e3b8af55f7059c342e3e3915f904/thumbnail.png">
      </a>
    </td>
    <td>
      Margin Convention II<br>
      <a href="http://bl.ocks.org/curran/735c8063f00c773ef1dea78f62a321fa">
        <img src="https://gist.githubusercontent.com/curran/b8e76dd7003538975b3e81e86ac6dd1e/raw/877922b6ee43e3b8af55f7059c342e3e3915f904/thumbnail.png">
      </a>
    </td>
  </tr>
  <tr>
    <td>
      Responsive Axes<br>
      <a href="http://bl.ocks.org/curran/6f97aa94357cae4611c54a80c11f6128">
        <img src="https://gist.githubusercontent.com/curran/6f97aa94357cae4611c54a80c11f6128/raw/1a7602461b9707a646c15cb3e92f06c0201b3725/thumbnail.png">
      </a>
    </td>
    <td>
      Baseball Scatter Plot<br>
      <a href="http://bl.ocks.org/curran/aff67b589d0f775a6a7b75f94a05fb14">
        <img src="http://bl.ocks.org/curran/raw/aff67b589d0f775a6a7b75f94a05fb14/thumbnail.png">
      </a>
    </td>
  </tr>
</table>


### AB

Here is an example where `b` gets set to `a + 1` whenever `a` changes:

```javascript
var my = ReactiveModel
  ("a") // Create the property "a" with no default value.
  ("b", function (a){
    return a + 1;
  }, "a");
```

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15453189/89c06740-2029-11e6-940b-58207a1492ca.png">
  <br>
  When a changes, b gets updated.
</p>

### ABC

Here's an example that assign `b = a + 1` and `c = b + 1`.

```javascript
function increment(x){ return x + 1; }

var my = ReactiveModel()
  ("a", 5) // Create the property "a" with a default value of 5.
  ("b", increment, "a")
  ("c", increment, "b");
```

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15385597/44a10522-1dc0-11e6-9054-2150f851db46.png">
  <br>
  Here, b is both an output and an input.
</p>

In this example, if `a` is assigned to the value 1 and a [digest](#digest) occurs, the value of `c` will be 3.

### CDE

Here's an example that shows a reactive function with multiple inputs, where `e` gets set to `c + d`.

```javascript
function add(x, y){ return x + y; }

var my = ReactiveModel()
  ("c", 5)
  ("d", 10)
  ("e", add, "c, d");
```

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15453417/d2179a14-2032-11e6-9cfb-024c416c699e.png">
  <br>
  A reactive function with two inputs.
</p>

### Full Name

Consider a [Web application that greets a user](http://bl.ocks.org/curran/b45cf8933cc018cf5bfd4296af97b25f). The user can enter his or her first name and last name, and the application will display a greeting using their full name. To start with, we can construct a `ReactiveModel` instance and add `firstName` and `lastName` properties. The naming convention of `my` pays homage to [Towards Reusable Charts](https://bost.ocks.org/mike/chart/).

```javascript
var my = ReactiveModel()
  ("firstName")
  ("lastName");
```

Invoking `my` with a string adds a property with the given name and returns `my` to support chaining. After properties are added, they are exposed as chainable getter-setters on `my`. Here's how you can set their values.

```javascript
my
  .firstName("Jane")
  .lastName("Smith");
```

Next, we set up a reactive function that computes `fullName`.

```javascript
my("fullName", function (firstName, lastName){
  return firstName + " " + lastName;
}, "firstName, lastName");
```

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15389922/cf3f24dc-1dd6-11e6-92d6-058051b752ea.png">
  <br>
  The data flow graph for the example code above.
</p>

Once we have `fullName` defined, we can use it as an input to another reactive function that computes the greeting.

```javascript
my("greeting", function (fullName){
  return "Hello " + fullName + "!";
}, "fullName");
```

When input properties are defined, the changes will automatically propagate through the data flow graph of reactive functions on the next animation frame. However, to force synchronous propagation of changes, we can call the following function.

```javascript
ReactiveModel.digest();
```

This ensures that the value of computed properties will be immediately available. We can access them like this.

```javascript
console.log(my.fullName()); // Prints "Jane Smith"
console.log(my.greeting()); // Prints "Hello Jane Smith!"
```

Reactive functions that have side effects but no output value can be defined by omitting the output property name argument. This is useful for DOM manipulation, such as passing the greeting text into a DOM element using D3.

```javascript
my(function (greeting){
  d3.select("#greeting").text(greeting);
}, "greeting");
```

Here's a [complete working example](http://bl.ocks.org/curran/b45cf8933cc018cf5bfd4296af97b25f) that extends the above example code to interact with DOM elements and display a greeting.

### Tricky Case

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15400254/7f779c9a-1e08-11e6-8992-9d2362bfba63.png">
  <br>
  The tricky case, where breadth-first propagation fails.
</p>

```javascript
function add(x, y){ return x + y; }

var my = ReactiveModel()
  ("a", 5)
  ("b", increment, "a")
  ("c", increment, "b")
  ("d", increment, "a")
  ("e", add, "b, d");
```

## Installing
You can include the library in your HTML like this:

```html
<script src="//datavis-tech.github.io/reactive-model/reactive-model-v0.8.0.min.js"></script>
```

If you are using [NPM](https://www.npmjs.com/package/reactive-model), install with `npm install reactive-model`, then require the module in your code like this:

```javascript
var ReactiveModel = require("reactive-model");
```

## API Reference

 * [Creating Reactive Models](#creating-reactive-models)
 * [Properties](#properties)
 * [Data Flow](#data-flow)
 * [Configuration](#configuration)

var my = ReactiveModel();

```javascript
my
  .x(10)
  .y(20);

("x", 5).expose()

var state = my();
my({
  x: 20,
  y: 50
});
my.on(function (newState){
my.off
("fullName", function (firstName, lastName){
  return firstName + " " + lastName;
}, ["firstName", "lastName"]);
ReactiveModel.digest();
  my.a(null);
  
("b", function (a, done){
  setTimeout(function (){
    done(a + 1);
  }, 20);
}, "a")

 my.destroy();
 .call(mixin);
  .call(mixin, 2);
```





### Creating Reactive Models

<a name="constructor" href="#constructor">#</a> <b>ReactiveModel</b>()

Constructs a new reactive model instance.

```javascript
var model = ReactiveModel();
```

<a name="destroy" href="#destroy">#</a> <i>model</i>.<b>destroy</b>()

Cleans up resources allocated to this model and removes listeners from all properties.

### Properties

<a name="add-property" href="#add-property">#</a> <i>model</i>(<i>propertyName</i>[, <i>defaultValue</i>])

Adds a property to the model. Returns the model to support chaining.

Arguments:

 * *propertyName* - The name of the property (a string).
 * *defaultValue* (optional) - The default value for this property.

The property is exposed as an instance of [reactive-property](https://github.com/datavis-tech/reactive-property) on the model object at `model[propertyName]`.

Here's example code that shows how to add a property `a` and access it.

```javascript
var model = ReactiveModel();

// Add property "a" with a default value of 5.
model("a", 5);

// Acces the value of "a".
model.a(); // returns 5

// Set the value of "a".
model.a(10);
```

### Data Flow

<a name="react" href="#react">#</a> <i>reactiveModel</i>([<i>output</i>, ]<i>callback</i>, <i>inputs</i>)

Arguments:

 * *output* (optional) - The output property name (a string).
 * *callback* - The reactive function callback (a function).
 * *inputs* - The list of input property names. May be either
   * a comma-delimited list of input property names (a string), or
   * an array of property name strings.

Adds the given reactive function to the data dependency graph.

Whenever any public property used as an input to a reactive function is set, the [`digest()`](#digest) function is automatically scheduled to be invoked on the next animation frame.

Asynchronous reactive functions are supported using an additional argument, the `done` callback, which should be called asynchronously with the new value for the output property. This is inspired by the [asynchronous tests in Mocha](https://mochajs.org/#asynchronous-code). Here's an asynchronous example:

```javascript
reactiveModel("b", function (a, done){
  setTimeout(function (){
    done(a + 1);
  }, 500);
}, "a");
```

<a name="digest" href="#digest">#</a> <i>ReactiveModel</i>.<b>digest</b>()

Synchronously evaluates the data dependency graph.


### Configuration

<a name="add-public-property" href="#add-public-property">#</a> <i>model</i>.<b>addPublicProperty</b>(<i>property</i>, <i>defaultValue</i>)

Adds a public property with the given default value.

Returns the `model` object, so is chainable, like this:

```javascript
var model = new ReactiveModel()
  ("x", 5).expose()
  ("y", 6).expose();
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
 * "reactive function" A callback function and metadata that describes its input and output properties. A specification for a reactive function is passed into `model()`. Any reactive function has:
   * input properties
   * output properties
   * callback(input values) -> output value (the "reactive function callback")
 * "digest" An execution of the algorithm that evaluates the data dependency graph. This includes topological sort.
 * "evaluate" A term to denote complete resolution of the data dependency graph. After the complete data dependency graph has been **evaluated** by a digest, the state of the model is consistent with regard to its reactive functions, and all reactive functions that are transitively dependent on any changed property have been executed in the proper order, with their output values assigned to model properties.

## How it Works

This library maintains an singleton instance of [graph-data-structure](https://github.com/datavis-tech/graph-data-structure) internally, called the "data dependency graph", in which

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

The state-related functions (addPublicProperty, state) were informed by work on the [Chiasm project](https://github.com/chiasm-propect/chiasm/). Chiasm manages synchronization of interactive visualizations with a dynamic application state configuration. In order to achieve predictable behavior, Chiasm introduces the notion of "public properties" and the requirement that they have default values. This is essential to achieve the goal of reversability for every action resulting from configuration changes (required to support undo/redo and history navigation, one of the goals of the Chiasm project).

Moving the publicProperty and serialization/deserialization semantics into the model abstraction seemed like a logical move. This will simplify the implementation of an engine like Chiasm, and will provide consistent serialization behavior for any users of reactive-model.

The `digest` function is exposed on the `ReactiveModel` constructor function rather than the `ReactiveModel` instance because there is a singleton data dependency graph shared by all reactive model instances. This approach was taken to enable reactive functions that take input from one model and yield output on another (via [bind](#bind)).

The term "digest" was chosen because it is already in common use within the AngularJS community and refers to almost exactly the same operation - see [AngularJS $digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest).

The motivation behind the organization of reactive function setup arguments is:

 * The dependencies could be inferred from the argument names of the callback, but this approach would break under minification (since argument names may be changed). Therefore, an explicit representation of the list of property names in string literal form is required.
 * The comma-delimited format was chosen so developers can easily copy-paste between the callback arguments and the input property names specification. The input property names specification is required because inferring the property names from function arguments breaks under minification. The option to specify an array of strings was added to support the case of programmatically generating the property names.
 * The dependencies list is the second argument so it does not make the first line of the expression very long. With Model.js, the dependencies list comes first, followed by the callback, so the repetition of dependencies falls on the same line. With the dependencies list as the second argument, it fits nicely onto its own line after the definition of the callback function.

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
 * [mobx](https://github.com/mobxjs/mobx) Very similar effort.
 * [RxJS](https://github.com/Reactive-Extensions/RxJS) and [Bacon](https://baconjs.github.io/) Full blown FRP packages.

<p align="center">
  <a href="https://datavis.tech/">
    <img src="https://cloud.githubusercontent.com/assets/68416/15298394/a7a0a66a-1bbc-11e6-9636-367bed9165fc.png">
  </a>
</p>
