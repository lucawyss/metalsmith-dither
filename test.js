var ImageDither = require('image-dither');
var Jimp = require('jimp');

var file = 'test/thumb.png';

Jimp.read(file, function(err, image) {
  var defaultDither, newData;
  if (err != null) {
    throw err;
  }
  defaultDither = new ImageDither;
  newData = defaultDither.dither(image.bitmap.data, image.bitmap.width);
  return new Jimp(image.bitmap.width, image.bitmap.height, function(err, newImage) {
    var i, j, ref;
    if (err != null) {
      throw err;
    }
    for (i = j = 0, ref = newData.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      newImage.bitmap.data[i] = newData[i];
    }
    newImage.write('default.png');
    return console.log('wrote default.png');
  });
});
