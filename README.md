# reactive-model

A library for building reactive models.

This is a weekend experiment that may be thrown away.

The core ideas of this are:

 * data dependency graphs can be speficied declaratively
 * processing of changes is delayed until the next animation frame
 * changes are processed using a topological sort algorithm

The reactive model maintains internally a directed acyclic graph data structure in which

 * vertices may be either properties or reactive functions
 * edges represent a data dependency

The algorithm for change processing will look something like this:

```
changeProperty(property)
  changed.push(property)

onAnimationFrame

  // Compute topologically sorted reactive functions
  // propagating changes from changed properties
  visited = []
  for each vertex u
    u.color = white
  for each property vertex u in changed
    if(u.color == white)
      DFS-Visit(u)

  // Execute topologically sorted reactive functions
  for each reactive function f in visited.reverse()
    execute f with proper inputs
    assign output value to output property

  changed = []

DFS-Visit(u)
  u.color = gray
  for each v in adjacent nodes of u
    if(v.color == white)
      if ( v is a reactive function )
        if ( all input values are defined )
          DFS-Visit(v)
      else if (v is a property)
        DFS-Visit(v)

  if ( u is a reactive function )
    visited.push(u)
```

This topological sort algorithm is taken from Cormen et. al. "Introduction to Algorithms" 3rd ed.


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
