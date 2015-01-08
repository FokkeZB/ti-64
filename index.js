// TODO: Alleen module ID+version tonen, niet volledig pad
// TODO: Ook global modules (tiapp.xml uitlezen)

var path = require('path');

var chalk = require('chalk'),
  timodules = require('timodules'),
  _ = require('lodash'),
  async = require('async');

var xcrun = require('./lib/xcrun'),
  util = require('./lib/util');

module.exports = function ti64(opts, callback) {
  opts || (opts = {});

  var projectDir = path.resolve(opts.projectDir);

  timodules.list(projectDir, function handle(err, res) {
    var allProjectModules, allGlobalModules, selectedGlobalModules = [],
      selectedProjectModules = [];

    if (err && !res) {
      callback(err);
      return;

    } else {
      allProjectModules = flatten(res.modules.project.iphone, false);
      allGlobalModules = flatten(res.modules.global.iphone, true);

      if (!opts.global) {
        selectedProjectModules = [];
        selectedGlobalModules = [];

        res.current.forEach(function forEach(currentModule) {
          var matchedModules;

          if ((currentModule.platform === undefined || currentModule.platform === 'iphone')) {
            matchedModules = _.filter(allProjectModules, filter, currentModule);

            if (matchedModules.length > 0) {
              selectedProjectModules = selectedProjectModules.concat(matchedModules);

            } else {
              selectedGlobalModules = selectedGlobalModules.concat(_.filter(allGlobalModules, filter, currentModule));
            }
          }

        });

      } else {
        selectedGlobalModules = allGlobalModules;
      }

      if (selectedProjectModules.length + selectedGlobalModules.length > 0) {

        var tasks = [];

        if (selectedProjectModules.length > 0) {

          tasks.push(function run(next) {
            check(selectedProjectModules, next);
          });

        }

        if (selectedGlobalModules) {

          tasks.push(function run(next) {
            check(selectedGlobalModules, next);
          });

        }

        async.series(tasks, function after(err, res) {

          callback(err, _.flatten(res));

        });

      } else {
        callback('No modules found');
      }
    }

  });

};

function filter(module) {
  var wantedModule = this;

  return (module.name === wantedModule.name && (wantedModule.version === undefined || wantedModule.version === module.version));
}

function flatten(modules, global) {
  var flat = [];

  _.each(modules, function forEach(versions, name) {

    _.each(versions, function forEach(info, version) {

      flat.push({
        name: name,
        platform: 'iphone',
        version: version,
        path: info.modulePath,
        global: global
      });

    });

  });

  return flat;
}

function check(modules, callback) {

  async.mapSeries(modules, function forEach(module, next) {

    xcrun.getArchitectures(path.join(module.path, 'lib' + module.name + '.a'), function handle(err, architectures) {

      if (err) {
        next(util.prefix(module) + chalk.red(err));

      } else {

        module.architectures = architectures;
        module.is64 = (architectures.indexOf('x86_64') !== -1 && architectures.indexOf('arm64') !== -1);

        next(null, module);
      }

    });

  }, callback);

}