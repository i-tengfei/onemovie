var gm = require('gm');

gm('test.jpg').interlace('Plane').write('test2.jpg', function (err) {
  if (!err) console.log('done');
});