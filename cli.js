#!/usr/bin/env node

var program = require('commander');

var pkg = require('./package.json');

var ti64 = require('./index');

program
  .version(pkg.version, '-v, --version')
  .description(pkg.description)
  .option('-d, --project-dir [path]', 'the directory containing the project [.]', process.cwd())
  .option('-g, --global', 'check all global modules');

program.parse(process.argv); 

ti64({
  projectDir: program.projectDir,
  global: program.global
});