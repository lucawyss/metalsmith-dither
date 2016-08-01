# metalsmith-dither

A [Metalsmith](https://github.com/metalsmith/metalsmith) plugin to dither images, based on [DitherJS](https://github.com/dpiccone/ditherjs).

The script take the image matching the `pattern` and make a *dithered* copy of the file, with a `suffix` added at the basename. The dithering effects can use of '*atkinson*' ou '*ordered*' `algorithm`. A color `palette` can be applied to the image. By default, the palette is black & white. The last parameter is the `step` for the pixel quantization ... in short the size of the pixel.

The script is dependent of [Jimp](https://github.com/oliver-moran/jimp) library.

## Install

```sh
npm install --save metalsmith-dither
```

## usage

```js
var Metalsmith = require('metalsmith');
var dither = require('metalsmith-dither');

var metalsmith = new Metalsmith(__dirname)
  .use(dither())
  .build();
```

## Options

```javascript
  .use(dither({
    pattern: "**/*.jpg", // using minimatch
    step: 1, // The step for the pixel quantization n = 1,2,3...
    palette: [[0,0,0],[255,255,255]], // an array of colors as rgb arrays
    suffix: '-dither', // suffix added to the basename of the file dithered
    algorithm: 'ordered' // dithering algorithm can be 'atkinson'
  }))
```

### Credits

The script is a fork of [DitherJS](https://github.com/dpiccone/ditherjs) by [Daniele Piccone](http://www.danielepiccone.com)

license MIT
