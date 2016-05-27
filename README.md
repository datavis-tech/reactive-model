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
   * [ABCs](#abcs)
   * [Full Name](#full-name)
   * [Tricky Cases](#tricky-cases)
 * [Installing](#installing)
 * [API Reference](#api-reference)
   * [Creating Reactive Models](#creating-reactive-models)
   * [Properties](#properties)
   * [Data Flow](#data-flow)
   * [Configuration](#configuration)
   * [Serialization](#serialization)

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

### ABCs

#### AB

Here is an example where `b` gets set to `a + 1` whenever `a` changes:

```javascript
var my = ReactiveModel()
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

The naming convention of `my` pays homage to [Towards Reusable Charts](https://bost.ocks.org/mike/chart/#reconfiguration).

#### ABC

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

See also [ABC in reactive-function](https://github.com/datavis-tech/reactive-function#abc).

#### CDE

Here's an example that shows a reactive function with two inputs, where `e = c + d`.

```javascript
function add(x, y){ return x + y; }

var my = ReactiveModel()
  ("c", 5)
  ("d", 10)
  ("e", add, ["c", "d"]);
```

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15453417/d2179a14-2032-11e6-9cfb-024c416c699e.png">
  <br>
  A reactive function with two inputs.
</p>

### Full Name

Consider a [Web application that greets a user](http://bl.ocks.org/curran/b45cf8933cc018cf5bfd4296af97b25f). The user can enter his or her first name and last name, and the application will display a greeting using their full name. To start with, we can construct a **[ReactiveModel](#constructor)** instance and [add properties](#add-property) `firstName` and `lastName` (with no default values).

```javascript
var my = ReactiveModel()
  ("firstName")
  ("lastName");
```

After properties are added, they are exposed as [chainable getter-setters](https://github.com/datavis-tech/reactive-property#accessing-properties) on `my`. Here's how you can set their values.

```javascript
my.firstName("Jane")
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

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15454247/a0fb4c1e-2050-11e6-8c76-111b9defa0ff.png">
  <br>
  The updated data flow graph including the greeting.
</p>

When input properties are defined, the changes will automatically propagate on the next animation frame. If you don't want to wait until the next animation frame for changes to propagate, you can force synchronous propagation by invoking **[digest](#digest)**.

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

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15454260/1f12dba8-2051-11e6-9fcf-4fa31e6ba365.png">
  <br>
  Reactive functions with no output property add unnamed nodes to the data flow graph.
</p>

Here's a [complete working example](http://bl.ocks.org/curran/b45cf8933cc018cf5bfd4296af97b25f) that extends the above example code to interact with DOM elements.

### Tricky Cases

#### Tricky Case I

Reactive functions can be combined to create arbitrarily complex data flow graphs. Here's an example that demonstrates why [topological sorting](https://en.wikipedia.org/wiki/Topological_sorting) is the correct algorithm for computing the order in which to execute reactive functions. In this graph, propagation using [breadth-first search](https://en.wikipedia.org/wiki/Breadth-first_search) (which is what [Model.js](https://github.com/curran/model) and some other libraries use) would cause `e` to be set twice, and the first time it would be set with an *inconsistent state*. Using topological sorting for change propagation guarantees that `e` will only be set once, and there will never be inconsistent states.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15400254/7f779c9a-1e08-11e6-8992-9d2362bfba63.png">
  <br>
  The tricky case, where breadth-first propagation fails.
</p>

```javascript
function increment(x){ return x + 1; }
function add(x, y){ return x + y; }

var my = ReactiveModel()
  ("a", 5)
  ("b", increment, "a")
  ("c", increment, "b")
  ("d", increment, "a")
  ("e", add, "b, d");
```

See also [Tricky Case in reactive-function](https://github.com/datavis-tech/reactive-function/blob/master/README.md#tricky-case).

#### Tricky Case II

Here's a similar case that reactive-model handles correctly. If breadth-first search were used in this case, then `h` would get set 3 times, the first two times with an inconsistent state.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/68416/15454976/472cf534-2064-11e6-9a19-865d6d6a1643.png">
  <br>
  Another tricky case where breadth-first propagation fails.
</p>

```javascript
function increment(x){ return x + 1; }
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
```

For more detailed example code, have a look at the [tests](https://github.com/datavis-tech/reactive-model/blob/master/test.js).

## Installing
You can include reactive-model in your HTML like this (will introduce a global variable `ReactiveModel`):

```html
<script src="//datavis-tech.github.io/reactive-model/reactive-model-v0.11.0.min.js"></script>
```

If you are using [NPM](https://www.npmjs.com/package/reactive-model), install with `npm install reactive-model`, then require the module in your code like this:

```javascript
var ReactiveModel = require("reactive-model");
```

## API Reference

 * [Models](#models)
 * [Properties](#properties)
 * [Data Flow](#data-flow)
 * [Configuration](#configuration)
 * [Serialization](#serialization)

### Models

<a name="constructor" href="#constructor">#</a> <b>ReactiveModel</b>()

Constructs a new reactive model instance.

Example:

```javascript
var model = ReactiveModel();
```

<a name="destroy" href="#destroy">#</a> <i>model</i>.<b>destroy</b>()

Cleans up resources allocated to this *model*. Invokes 

 * [reactiveFunction.destroy()](https://github.com/datavis-tech/reactive-function/blob/master/README.md#destroy) on all reactive functions created on this model, and 
 * [reactiveProperty.destroy()](https://github.com/datavis-tech/reactive-property#destroy) on all properties created on this model.

You should invoke this function when finished using model instances in order to avoid memory leaks.

### Properties

<a name="add-property" href="#add-property">#</a> <b><i>model</i></b>(<i>propertyName</i>[, <i>defaultValue</i>])

Adds a property to the model. Returns the model to support chaining.

Arguments:

 * *propertyName* - The name of the property (a string).
 * *defaultValue* (optional) - The default value for this property.

After a property is added, it is exposed as an instance of [reactive-property](https://github.com/datavis-tech/reactive-property) on the model object at `model[propertyName]`.

Example:

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

<a name="reactive-function" href="#reactive-function">#</a> <b><i>model</i></b>([<i>output</i>,] <i>callback</i>, <i>inputs</i>)

Adds a reactive function to this model.

Arguments:

 * *output* (optional) - The output property name.
 * *callback* - The reactive function callback. Arguments are values corresponding to *inputs*. May be of two forms:
   * <b>callback</b>(<i>arguments…</i>) For synchronous reactive functions. The returned value will be assigned to *output*. 
   * <b>callback</b>(<i>arguments…</i>, <i>done</i>) For asynchronous reactive functions. The function *done* should be invoked asynchronously with the value to assign to *output*. The returned value is ignored.
 * *inputs* - The input property names. May be either
   * a comma-delimited list of input property names (e.g. `"a, b"`), or
   * an array of property name strings (e.g. `["a", "b"]`).

The *callback* will be invoked:

 * when all input properties are defined,
 * after any input properties change,
 * during a **[digest](#digest)**.

An input property is considered "defined" if it has any value other than `undefined` (`null` is considered defined).

An input property is considered "changed" when

 * the reactive function is initially set up, and
 * whenever its value is set.

Any input property for one reactive function may also be the output of another.

Here's an example of an asynchronous reactive function.

```javascript
var model = ReactiveModel()
  ("a", 50)
  ("b", function (a, done){
    setTimeout(function (){
      done(a + 1);
    }, 500);
  }, "a");
```

See also **[ReactiveFunction](https://github.com/datavis-tech/reactive-function/#constructor)**.

<a name="link" href="#link">#</a> <i>ReactiveModel</i>.<b>link</b>(<i>propertyA</i>, <i>propertyB</i>)

Sets up one-way data binding from *propertyA* to *propertyB*. Returns an instance of **[ReactiveFunction](#constructor)**.

This can be used to set up data flow between two different models. For example, a computed property on one model can be linked to a configurable input property of another model. This function enables model instances to be treated as data flow components, and allows them to be assembled into user-defined data flow graphs.

Arguments:

 * *propertyA* - A [reactive-property](https://github.com/datavis-tech/reactive-property). 
 * *propertyB* - A [reactive-property](https://github.com/datavis-tech/reactive-property) that will be set to the value of *propertyA* and updated whenever *propertyA* changes.

Example:

```javascript
var model1 = ReactiveModel()
  ("someOutput", 5);

var model2 = ReactiveModel()
  ("someInput", 10);

var link = ReactiveModel.link(model1.someOutput, model2.someInput);

ReactiveModel.digest();
console.log(model2.someInput()); // Prints 5

model1.someOutput(500);
ReactiveModel.digest();
console.log(model2.someInput()); // Prints 500

// The link needs to be explicitly destroyed, independently from the models.
link.destroy();
```

This is the same function as **[ReactiveFunction.link](https://github.com/datavis-tech/reactive-function#link)**.

<a name="digest" href="#digest">#</a> <i>ReactiveModel</i>.<b>digest</b>()

Synchronously evaluates the data flow graph. This is the same function as **[ReactiveFunction.digest()](https://github.com/datavis-tech/reactive-function#digest)**.

<a name="call" href="#call">#</a> <i>model</i>.<b>call</b>(<i>function</i>[, <i>arguments…</i>])

Invokes the *function*, passing in *model* along with any optional *arguments*. Returns the model to support chaining.

Example:

```javascript
function fullName(my, first, last) {
  my
    ("firstName", first)
    ("lastName", last)
    ("fullName", function (firstName, lastName){
      return firstName + " " + lastName;
    }, "firstName, lastName");
}
```

The above function can be invoked like this:

```javascript
var model = ReactiveModel()
  .call(fullName, "Jane", "Smith");
```

This is equivalent to:

```javascript
var model = ReactiveModel();
fullName(model, "Jane", "Smith");
```

### Configuration

<a name="expose" href="#expose">#</a> <i>model</i>.<b>expose</b>()

Exposes the previously added property to the configuration. Returns the model to support chaining.

The property to expose *must* have a default value defined.

Here's an example where two properties `x` and `y` are defined with default values and exposed to the configuration.

```javascript
var model = new ReactiveModel()
  ("x", 5).expose()
  ("y", 6).expose();
```

<a name="get-configuration" href="#get-configuration">#</a> <b><i>model</i></b>()

Returns the configuration, an Object where

 * keys are property names, and
 * values are current property values.

The configuration only contains [exposed](#expose) properties that have values other than their defaults.

Example:

```javascript
var model = new ReactiveModel()
  ("x", 5).expose()
  ("y", 6).expose();
  
model.x(50);

var configuration = model();
```
The value of `configuration` will be:

```json
{ "x": 50 }
```

Note that `y` is omitted, because it has its default value.

<a name="set-configuration" href="#set-configuration">#</a> <b><i>model</i></b>(<i>configuration</i>)

Sets the configuration.

The argument *configuration* is an Object where

 * keys are property names, and
 * values are property values to be set.

Only [exposed](#expose) properties may be set via the configuration. Exposed properties whose values are not included in *configuration* will be set to their default values.

Example:

```javascript
var model = new ReactiveModel()
  ("x", 5).expose()
  ("y", 6).expose();
  
model.x(50);

// Set the configuration.
model({ y: 60 });

console.log(model.x()); // Prints 5 (x was set back to its default value).
console.log(model.y()); // Prints 60.
```

<a name="on" href="#on">#</a> <i>model</i>.<b>on</b>(<i>listener</i>)

Listen for changes in configuration. Returns the listener function that can be used to stop listening for changes.

The argument *listener* is a function of the form <b>listener</b>(<i>configuration</i>), where *configuration* is the same object returned from [model()](#get-configuration). This function is invoked after [exposed](#expose) properties are changed.

<a name="off" href="#on">#</a> <i>model</i>.<b>off</b>(<i>listener</i>)

Stop listening for changes in configuration. The argument *listener* must be the value returned from **[on](#on)** (not the function passed into **[on](#on)**).

### Serialization

<a name="serialize" href="#serialize">#</a> ReactiveModel.<b>serializeGraph</b>()

Serializes the data flow graph. Returns an object with the following properties.

 * `nodes` An array of objects, each with the following properties.
   * `id` The node identifier string.
   * `propertyName` The property name. This is the empty string for output nodes of reactive functions with no output property.
 * `links` An array of objects representing edges, each with the following properties.
   * `source` The node identifier string of the source node (**u**).
   * `target` The node identifier string of the target node (**v**).

Example:

```javascript
var my = ReactiveModel()
  ("firstName", "Jane")
  ("lastName", "Smith")
  ("fullName", function (firstName, lastName){
    return firstName + " " + lastName;
  }, "firstName, lastName");

var serialized = ReactiveModel.serializeGraph();
```
The value of `serialized` will be:

```json
{
  "nodes": [
    { "id": "95", "propertyName": "fullName" },
    { "id": "96", "propertyName": "firstName" },
    { "id": "97", "propertyName": "lastName" }
  ],
  "links": [
    { "source": "96", "target": "95" },
    { "source": "97", "target": "95" }
  ]
}
```

See also:

 * <a href="https://github.com/datavis-tech/reactive-function#serialize">ReactiveFunction.<b>serializeGraph</b>()</a>
 * <a href="https://github.com/datavis-tech/graph-data-structure#serialize"><i>graph</i>.<b>serialize</b>()</a>
 * [graph-diagrams](https://github.com/datavis-tech/graph-diagrams/)

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
