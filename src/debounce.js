import nextFrame from "./nextFrame";

// Queues the given callback function to execute
// on the next animation frame.
export default function debounce(callback){
  var queued = false;
  return function () {
    if(!queued){
      queued = true;
      nextFrame(function () {
        queued = false;
        callback();
      });
    }
  };
}
