var Metalsmith  = require('metalsmith');
var dither = require('./index');

Metalsmith(__dirname)
  .source('./src')
  .destination('./test')
  .use(dither({
    pattern: "**/*.png"
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });
