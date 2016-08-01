'use strict';

// var debug = require('debug')('metalsmith-dither');
// var ImageDither = require('image-dither');
// var DitherJS = require('ditherjs');
// var nodeDither = require('node-dithering');
var Jimp = require('jimp');

var path = require('path');
var fs = require("fs");
var matcher = require('minimatch');
var _ = require('lodash');



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

        // construction path and file name
        var imagePathsrc, imagePathdir, imagePathext, imagePathbasename, imagePathabs, imagePathdest;
        imagePathsrc = file;
        imagePathdir = file.substring(0, file.lastIndexOf('/'));
          if(imagePathdir != '') {imagePathdir += '/';}
        imagePathext = path.extname(file);
        imagePathbasename = path.basename(file, imagePathext);
        imagePathabs = metalsmith.source() + '/' + file;
        imagePathdest = metalsmith.destination() + '/' + imagePathdir;
        imagePathdest += imagePathbasename + options.suffix + imagePathext;
        console.log(imagePathdest);

        // dither options
        var palette = options.palette;
        var step = options.step;

        new Jimp.read(imagePathabs, function(err, image) {
          // atkinsonDither();
          var newData = orderedDither(image.bitmap.data, image.bitmap.height,image.bitmap.width, palette, step);
          return new Jimp(image.bitmap.width, image.bitmap.height, function(err, newImage) {
            var i, j, ref;
            if (err != null) {
              throw err;
            }
            for (i = j = 0, ref = newData.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
              newImage.bitmap.data[i] = newData[i];
            }
            newImage.write(imagePathdest);
            return console.log(file + ' is dithered !');
          });
        });



      });
  };

}


/* *
    * Dithering algorithms
    *
    * orderedDither
    * atkinsonDither
    * errorDiffusionDither
    * */

   function orderedDither(imgdata, h, w, palette, step) {
       var d = new Uint8ClampedArray(imgdata);
       var ratio = 3;
       var m = new Array(
           [  1,  9,  3, 11 ],
           [ 13,  5, 15,  7 ],
           [  4, 12,  2, 10 ],
           [ 16,  8, 14,  6 ]
       );

       var r, g, b, a, q, i, color, approx, tr, tg, tb, dx, dy, di;

       for (var y=0;y<h;y += step) {
           for (var x=0;x<w;x += step) {
               i = (4*x) + (4*y*w);

               // Define bytes
               r = i;
               g = i+1;
               b = i+2;
               a = i+3;

               d[r] += m[x%4][y%4] * ratio;
               d[g] += m[x%4][y%4] * ratio;
               d[b] += m[x%4][y%4] * ratio;

               //var tr = threshold(d[r]);
               //var tg = threshold(d[g]);
               //var tb = threshold(d[b]);
               color = new Array(d[r],d[g],d[b]);
               approx = approximateColor(color, palette);
               tr = approx[0];
               tg = approx[1];
               tb = approx[2];

               // d[r] = t;
               // d[g] = t;
               // d[b] = t;

               // Draw a block
               for (dx=0;dx<step;dx++){
                   for (dy=0;dy<step;dy++){
                       di = i + (4 * dx) + (4 * w * dy);

                       // Draw pixel
                       d[di] = tr;
                       d[di+1] = tg;
                       d[di+2] = tb;

                   }
               }
           }
       }
       return d;
   }


function atkinsonDither(imgdata, h, w, palette, step) {
        var d = new Uint8ClampedArray(imgdata);
        var out = new Uint8ClampedArray(imgdata);
        var ratio = 1/8;

        var $i = function(x,y) {
            return (4*x) + (4*y*w);
        };

        var r, g, b, a, q, i, color, approx, tr, tg, tb, dx, dy, di;

        for (var y=0;y<h;y += step) {
            for (var x=0;x<w;x += step) {
                i = (4*x) + (4*y*w);

                // Define bytes
                r = i;
                g = i+1;
                b = i+2;
                a = i+3;

                color = new Array(d[r],d[g],d[b]);
                approx = approximateColor(color, palette);

                q = [];
                q[r] = d[r] - approx[0];
                q[g] = d[g] - approx[1];
                q[b] = d[b] - approx[2];

                // Diffuse the error for three colors
                d[$i(x+step,y) + 0] += ratio * q[r];
                d[$i(x-step,y+step) + 0] += ratio * q[r];
                d[$i(x,y+step) + 0] += ratio * q[r];
                d[$i(x+step,y+step) + 0] += ratio * q[r];
                d[$i(x+(2*step),y) + 0] += ratio * q[r];
                d[$i(x,y+(2*step)) + 0] += ratio * q[r];

                d[$i(x+step,y) + 1] += ratio * q[g];
                d[$i(x-step,y+step) + 1] += ratio * q[g];
                d[$i(x,y+step) + 1] += ratio * q[g];
                d[$i(x+step,y+step) + 1] += ratio * q[g];
                d[$i(x+(2*step),y) + 1] += ratio * q[g];
                d[$i(x,y+(2*step)) + 1] += ratio * q[g];

                d[$i(x+step,y) + 2] += ratio * q[b];
                d[$i(x-step,y+step) + 2] += ratio * q[b];
                d[$i(x,y+step) + 2] += ratio * q[b];
                d[$i(x+step,y+step) + 2] += ratio * q[b];
                d[$i(x+(2*step),y) + 2] += ratio * q[b];
                d[$i(x,y+(2*step)) + 2] += ratio * q[b];

                tr = approx[0];
                tg = approx[1];
                tb = approx[2];

                // Draw a block
                for (dx=0;dx<step;dx++){
                    for (dy=0;dy<step;dy++){
                        di = i + (4 * dx) + (4 * w * dy);

                        // Draw pixel
                        out[di] = tr;
                        out[di+1] = tg;
                        out[di+2] = tb;

                    }
                }
            }
        }
        return out;
}


/**
  * Return a distance of two colors ina three dimensional space
  * @param array
  * @param array
  * @return number
  * */
  function colorDistance(a,b) {
      //if (a == null) return b;
      //if (b == null) return a;
      return Math.sqrt(
          Math.pow( ((a[0]) - (b[0])),2 ) +
          Math.pow( ((a[1]) - (b[1])),2 ) +
          Math.pow( ((a[2]) - (b[2])),2 )
      );
  }

  /**
  * Return the most closer color vs a common palette
  * @param array - the color
  * @return i - the index of the coloser color
  * */
  function approximateColor(color, palette) {
      var findIndex = function(fun,arg,list,min) {
          if (list.length == 2) {
              if (fun(arg,min) <= fun(arg,list[1])) {
                  return min;
              }else {
                  return list[1];
              }
          } else {
              //var hd = list[0];
              var tl = list.slice(1);
              if (fun(arg,min) <= fun(arg,list[1])) {
                  min = min;
              } else {
                  min = list[1];
              }
              return findIndex(fun,arg,tl,min);
          }
      };
      var found_color = findIndex(colorDistance, color, palette, palette[0]);
      return found_color;
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
    pattern: '**/*.jpg',
    palette: [[0, 0, 0], [255,255,255]],
    step: 1,
    suffix: '-dither'
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
