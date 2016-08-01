'use strict';

// var debug = require('debug')('metalsmith-dither');
var ImageDither = require('image-dither');
var Jimp = require('jimp');
// var util = require('util');
var path = require('path');
var fs = require("fs");
var matcher = require('minimatch');
var _ = require('lodash');


// var dither = new Dither({matrix: Dither.matrices.atkinson});
// var img = magicallyRetrieveBuffer('path/to/img.png');
// var imgWidth = magicallyRetrieveWidth('path/to/img.png');
//
// var ditheredImg = dither.dither(img, imgWidth);

module.exports = dither;

function dither(options){

  return function(files, metalsmith, done){
    ditherImage(files, metalsmith, done, options);
    done();
  };


  function ditherImage(files, metalsmith, done, options) {
      options = normalizeOptions(options);
      var matchingFiles = getMatchingFiles(files, options.pattern);
      _.each(matchingFiles, function(file) {
        var imagePath = {};
        imagePath.src = file;
        imagePath.dir = file.substring(0, file.lastIndexOf('/'));
          if(imagePath.dir != '') {imagePath.dir += '/';}
        imagePath.ext = path.extname(file);
        imagePath.basename = path.basename(file, imagePath.ext);
        imagePath.abs = metalsmith.source() + '/' + file;
        imagePath.dest = metalsmith.destination() + '/' + imagePath.dir;
        imagePath.dest += imagePath.basename + '-dither' + imagePath.ext;


        Jimp.read(imagePath.abs, function(err, image) {
          var defaultDither = new ImageDither;
          var newData = defaultDither.dither(image.bitmap.data, image.bitmap.width);
          return new Jimp(image.bitmap.width, image.bitmap.height, function(err, newImage) {
            var i, j, ref;
            if (err != null) {
              throw err;
            }
            for (i = j = 0, ref = newData.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
              newImage.bitmap.data[i] = newData[i];
            }
            newImage.write(imagePath.dest);
            return console.log(file + ' is dithered !');
          });
        });




      });
  };

}



















/**
 * @param {Object} options
 * @param {Array} authorized extensions - e.g ['jpg', 'png', 'gif']
 * @return {Object}
 */

function normalizeOptions(options) {
  // define options
  var defaultOptions = {
    authorizedExts: ['jpg', 'jpeg', 'svg', 'png', 'gif', 'JPG', 'JPEG', 'SVG', 'PNG', 'GIF'],
    pattern: '**/*.jpg'
  };

  return _.extend(defaultOptions, options);
}


/**
 * @param {String} file
 * @param {Array} authorized extensions - e.g ['jpg', 'png', 'gif']
 * @return {Boolean}
 */

function isAuthorizedFile(file, authorizedExtensions) {
  // get extension
  var extension = file.split('.').pop();
  return _.includes(authorizedExtensions, extension);
}


/**
 * @param {Array} files
 * @param {String} pattern
 *
 */
function getMatchingFiles(files, pattern) {
  var keys = Object.keys(files);

  return _.filter(keys, function(file) {
    files[file].path = path.parse(file);

    // check if file is in the right path using regexp
    return matcher(file, pattern);
  });
}
