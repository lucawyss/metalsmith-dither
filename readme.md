# metalsmith-dither

A [Metalsmith](https://github.com/metalsmith/metalsmith) plugin to dither images, based on [DitherJS](https://github.com/dpiccone/ditherjs).

## Install

```sh
npm install --save git+https://git@github.com:lucawyss/metalsmith-dither.git
```

## usage

```js
var Metalsmith = require('metalsmith');
var dither = require('metalsmith-dither');

var metalsmith = new Metalsmith(__dirname)
  .use(dither({
    pattern: "**/*.png",
    palette: [[0,0,0],[233,93,16],[22,162,240]],
    step: 1
  }))
  .build();
```

## Options

```javascript
var defaultOptions = {
    pattern: "**/*.jpg", // using minimatch
    step: 1, // The step for the pixel quantization n = 1,2,3...
    palette: [[0,0,0],[255,255,255]] // an array of colors as rgb arrays
};
```

### Credits

The script is a fork of [DitherJS](https://github.com/dpiccone/ditherjs) by [Daniele Piccone](http://www.danielepiccone.com)

license MIT
