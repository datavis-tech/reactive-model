// A simple requestAnimationFrame polyfill.
//
// Inspired by:
//
//   https://github.com/chrisdickinson/raf
//   http://jsmodules.io/
//
// Curran Kelleher June 2015
var nextFrame;
if(typeof requestAnimationFrame === "undefined"){
  nextFrame = setTimeout;
} else {
  nextFrame = requestAnimationFrame;
}
export default nextFrame;
