# onion-stickys
A sticky sidebar implementation for onion properties.


## Developing
Install dependencies:

`npm install`
`bower install`

Use the [Makefile](Makefile) while developing:

* `all`: builds production and debug versions
* `watch`: watches source and runs `make all` on changes
* `debug`: builds the debug version
* `shim`: builds a browserify shimmed version

## Installing

Install into your app.
`bower install onion-sticky`

## Implementing
```javascript
var OnionSticky = require('onion-sticky/dist/onion-sticky.browserify-shim.js').OnionSticky;

this.onionSticky = new OnionSticky({
  // To get helpful frame-by-frame breakdown of what OnionSticky is doing, set this to true
  printDebug: false,
  
  // The jQuery wrapped element that you want to stick.
  // <body>
  //  <header/>
  //  <main>
  //    <aside/> <--- This is element
  //    <article/>
  element: this.sidebar,
  
  // The jQuery wrapped container to stick to.
  // <body>
  //  <header/>
  //  <main>      <--- This is container
  //    <aside/>
  //    <article/>
  container: this.container,
  
  // The jQuery wrapped element that we should watch for scroll changes
  scrollContainer: this.scrollContainer,
  
  // Function that returns height in pixels to stick to from the top of the viewport
  //   Add together things like header+advertisement height.
  getDistanceFromTop: this.getDistanceFromTop.bind(this),

  // Function that returns height in pixels to stick to from the bottom of the viewport
  //   Add together things like footer height.
  getDistanceFromBottom: this.getDistanceFromBottom.bind(this),
  
  // Should the sticky element follow the scrollling?
  // If the sticky element is restricted in size to the height of inner viewport, 
  //   such as in cases to allow inner scrolling in the sticky element, this should be true.
  followScroll: $(document.body).hasClass('detail')
});
this.onionSticky.animationLoop();
```
