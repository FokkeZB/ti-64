var chalk = require('chalk');

exports.prefix = function prefix(module) {
  return chalk.yellow(module.name) + '@' + chalk.cyan(module.version) + ':' + chalk.yellow(module.global ? 'global' : 'project') + ' ';
};