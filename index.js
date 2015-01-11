// TODO: Alleen module ID+version tonen, niet volledig pad
// TODO: Ook global modules (tiapp.xml uitlezen)

var path = require('path');

var chalk = require('chalk'),
  timodules = require('timodules'),
  _ = require('lodash'),
  glob = require('glob'),
  async = require('async');

var xcrun = require('./lib/xcrun');

module.exports = function ti64(opts, callback) {
  opts || (opts = {});

  var projectDir = path.resolve(opts.projectDir);

  if (opts.path) {

    if (path.extname(opts.path) === '.a') {
      var libPath = path.resolve(opts.path);

      checkLib(libPath, function handle(err, res) {

        if (err) {
          callback(err);

        } else {
          var modules = {};

          var matches = libPath.match(/(?:\/([0-9].+)\/)?lib(.+)\.a$/);

          if (!matches) {
            callback('Failed to parse path: ' + libPath);

          } else {
            var name = matches[2].toLowerCase();

            res.name = name;
            res.version = matches[1];
            res.path = libPath;

            modules[name] = {
              name: name,
              versions: [res]
            };

            callback(null, modules);
          }
        }

      });

    } else {

      glob('**/lib*.*.a', {
        cwd: projectDir

      }, function handle(er, files) {

        if (er) {
          callback(er);

        } else {
          modules = {};

          async.mapSeries(files, function forEach(file, next) {
            var libPath = path.join(projectDir, file);

            var matches = libPath.match(/(?:\/([0-9].+)\/)?lib(.+)\.a$/);

            if (!matches) {
              next('Failed to parse path: ' + libPath);

            } else {
              var name = matches[2].toLowerCase();

              if (!modules[name]) {
                modules[name] = {
                  name: name,
                  versions: []
                };
              }

              var version = {
                name: name,
                version: matches[1],
                path: path.dirname(libPath)
              };

              checkLib(libPath, function handle(err, res) {

                if (err) {
                  version.error = err;

                } else {
                  _.extend(version, res);
                }

                modules[name].versions.push(version);

                next();

              });
            }

          }, function after(err) {
            callback(err, modules);
          });

        }
      });
    }

  } else {

    timodules.list(projectDir, function handle(err, res) {
      var projectModules, globalModules, selectedModules = [];

      if (err && (!opts.global || !res)) {
        callback('No project found');
        return;

      } else {
        projectModules = flatten(res.modules.project.iphone, true);
        globalModules = flatten(res.modules.global.iphone, false);

        if (!opts.global) {

          res.current.forEach(function forEach(currentModule) {
            var matchedModules;

            if ((currentModule.platform === undefined || currentModule.platform === 'iphone')) {
              matchedModules = _.filter(projectModules, filter, currentModule);

              if (matchedModules.length > 0) {
                selectedModules = selectedModules.concat(matchedModules);

              } else {
                selectedModules = selectedModules.concat(_.filter(globalModules, filter, currentModule));
              }
            }

          });

        } else {
          selectedModules = globalModules;
        }

        if (selectedModules.length) {

          async.mapSeries(selectedModules, function forEach(module, next) {
            var libPath = path.join(module.path, 'lib' + module.name + '.a');

            checkLib(libPath, function handle(err, res) {

              if (err) {
                module.error = err;

              } else {
                _.extend(module, res);
              }

              next(null, module);
            });

          }, function after(err, res) {
            var modules;

            if (err) {
              callback(err);

            } else {
              modules = res;
              res = {};

              modules.forEach(function forEach(module) {

                if (module) {

                  if (res[module.name] === undefined) {
                    res[module.name] = {
                      name: module.name,
                      has64: false,
                      versions: []
                    };
                  }

                  res[module.name].has64 = res[module.name].has64 || module.has64;
                  res[module.name].versions.push(module);
                }

              });

              callback(null, res);
            }

          });

        } else {
          callback('No modules found');
        }
      }

    });
  }

};

function filter(module) {
  var wantedModule = this;

  return (module.name === wantedModule.name && (wantedModule.version === undefined || wantedModule.version === module.version));
}

function flatten(modules, project) {
  var flat = [];

  _.each(modules, function forEach(versions, name) {

    _.each(versions, function forEach(info, version) {

      flat.push({
        name: name,
        version: version,
        path: info.modulePath,
        project: project
      });

    });

  });

  return flat;
}

function checkLib(libPath, callback) {

  xcrun.getArchitectures(libPath, function handle(err, architectures) {

    if (err) {
      callback(err);

    } else {
      callback(null, {
        architectures: architectures,
        has64: (architectures.indexOf('x86_64') !== -1 && architectures.indexOf('arm64') !== -1)
      });
    }
  });

}
