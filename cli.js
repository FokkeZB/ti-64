#!/usr/bin/env node

var program = require('commander'),
  chalk = require('chalk');

var pkg = require('./package.json'),
  ti64 = require('./index'),
  util = require('./lib/util');

program
  .version(pkg.version, '-v, --version')
  .description(pkg.description)
  .option('-d, --project-dir [path]', 'the directory containing the project [.]', process.cwd())
  .option('-g, --global', 'check all global modules');

program.parse(process.argv);

ti64({
  projectDir: program.projectDir,
  global: program.global

}, function handle(err, res) {

  if (err) {
    chalk.red(err);
    process.exit(1);

  } else {

    res.forEach(function forEach(module) {
      console[module.is64 ? 'log' : 'error'](util.prefix(module) + chalk[module.is64 ? 'green' : 'red'](module.architectures.join(' ')));
    });

  }

});
