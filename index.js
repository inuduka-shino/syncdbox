/*eslint no-console: 0 */
'use strict';

(function () {
  const commandArgs = require('./lib/commandArgs.js');
  console.log('start');

  console.log(commandArgs.mode);
  if (commandArgs.mode === 'push') {
    require('./lib/push.js').start();
  } else if (commandArgs.mode === 'pull') {
    require('./lib/pull.js').start();
  } else {
    throw new Error(`unkown subcommand ${commandArgs.mode}`);
  }
  console.log('end');

}());
