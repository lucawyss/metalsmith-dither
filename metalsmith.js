var Metalsmith  = require('metalsmith');
var dither = require('./index');

Metalsmith(__dirname)
  .source('./src')
  .destination('./test')
  .use(dither({
    pattern: "**/*.png",
    palette: [[0,0,0],[233,93,16],[22,162,240]],
    step: 1
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });
