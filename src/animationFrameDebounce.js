// Simplistic requestAnimationFrame polyfill.
export var nextFrame = (typeof requestAnimationFrame === "undefined") ? setTimeout : requestAnimationFrame;

// Returns a debounced version of the given function
// that will execute on the next animation frame.
// Similar to http://underscorejs.org/#debounce
export function animationFrameDebounce(callback){
  var queued = false;
  return function () {
    if(!queued){
      queued = true;
      nextFrame(function () {
        queued = false;
        callback();
      }, 0);
    }
  };
}
