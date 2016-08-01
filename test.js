var ImageDither = require('image-dither');
var Jimp = require('jimp');

var file = 'test/thumb.png';



var palette = [];
palette.push([0, 0, 0, 255]);
palette.push([233,93,16, 255]);
palette.push([22,162,240, 255]);

var findColor = function(rgba) {
  var bestColor, bestDelta, c, delta, k, len;
  bestDelta = Infinity;
  bestColor = null;
  for (k = 0, len = palette.length; k < len; k++) {
    c = palette[k];
    delta = Math.sqrt(Math.pow(c[0] - rgba[0], 2) + Math.pow(c[1] - rgba[1], 2) + Math.pow(c[2] - rgba[2], 2));
    if (delta < bestDelta) {
      bestDelta = delta;
      bestColor = c;
    }
  }
  return bestColor;
};
