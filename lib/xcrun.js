var child_process = require('child_process');

var REGEXP_ARCHITECTURES = / are: (.+) \n$/;

exports.getArchitectures = function getArchitectures(path, callback) {
  var spawned = child_process.spawn('xcrun', ['lipo', '-info', path]);
  var output = '';

  spawned.stdout.on('data', function(data) {
    output += data.toString();
  });

  spawned.on('close', function(code) {

    if (code !== 0) {
      callback('Failed to read architectures');

    } else {

      var matches = output.match(REGEXP_ARCHITECTURES);

      if (matches === null) {
        callback('Failed to extract architectures');
      }

      var architectures = matches[1].split(' ');

      callback(null, architectures);
    }

  });

};
