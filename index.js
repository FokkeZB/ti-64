// TODO: Alleen module ID+version tonen, niet volledig pad
// TODO: Ook global modules (tiapp.xml uitlezen)

var path = require('path');

var chalk = require('chalk'),
  timodules = require('timodules'),
  _ = require('lodash');

var xcrun = require('./lib/xcrun');

module.exports = function ti64(opts) {
  opts || (opts = {});

  var projectDir = path.resolve(opts.projectDir);

  timodules.list(projectDir, function handle(err, res) {
    var allProjectModules, allGlobalModules, selectedGlobalModules = [],
      selectedProjectModules = [];

    if (err) {
      console.error(chalk.red(err));
      process.exit(1);

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

        if (selectedProjectModules.length > 0) {
          check(selectedProjectModules);
        }

        if (selectedGlobalModules) {
          check(selectedGlobalModules);
        }

      } else {
        console.warn('No modules found');
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

function check(modules) {

  modules.forEach(function forEach(module) {
    var prefix = chalk.yellow(module.name) + ':' + chalk.cyan(module.version) + '@' + chalk.yellow(module.global ? 'global' : 'project') + ' ';

    xcrun.getArchitectures(path.join(module.path, 'lib' + module.name + '.a'), function handle(err, architectures) {

      if (err) {
        console.error(prefix + chalk.red(err));

      } else {

        if (architectures.indexOf('x86_64') !== -1 && architectures.indexOf('arm64') !== -1) {
          console.log(prefix + chalk.green(architectures.join(' ')));
        } else {
          console.error(prefix + chalk.red(architectures.join(' ')));
        }
      }

    });

  });

}
