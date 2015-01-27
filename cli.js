#!/usr/bin/env node

var program = require('commander'),
  chalk = require('chalk'),
  _ = require('lodash'),
  updateNotifier = require('update-notifier');

var pkg = require('./package.json'),
  ti64 = require('./index');

program
  .version(pkg.version, '-v, --version')
  .usage('[options] [path]')
  .description(pkg.description)
  .option('-d, --project-dir <path>', 'the directory containing the project ' + chalk.grey('[.]'), process.cwd())
  .option('-g, --global', 'check all global modules')
  .option('-o, --output <value>', 'output format ' + chalk.grey('[report, json]'), 'report');

program.parse(process.argv);

updateNotifier({
  packageName: pkg.name,
  packageVersion: pkg.version
}).notify();

ti64({
  projectDir: program.projectDir,
  global: program.global,
  path: program.args[0]

}, function handle(err, res) {

  if (program.output === 'json') {
    console.log(JSON.stringify({
      err: err,
      res: res
    }, null, '  '));

  } else {

    if (err) {
      console.error(chalk.red(err));
      process.exit(1);

    } else {

      _.forEach(res, function forEach(module) {
        console[module.has64 ? 'log' : 'error'](chalk[module.has64 ? 'green' : 'red'](module.name));

        _.forEach(module.versions, function forEach(version) {
          console[version.has64 ? 'log' : 'error']('  ' + chalk[version.has64 ? 'green' : 'red'](version.version) + ((program.global || program.args[0]) ? '' : chalk.cyan(' (' + (version.project ? 'project' : 'global') + ')')) + ' ' + (version.error ? 'undefined ' + chalk.red('[ERROR] ' + version.error) : version.architectures.join(' ')));
        });

      });

    }

  }

});
