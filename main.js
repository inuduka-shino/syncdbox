/*eslint no-console: 0 */
(function () {
  'use strict';

const
  co = require('co'),
  commandArgs = require('./lib/commandArgs'),
  mError = require('./lib/localError'),
  subcmd = require('./lib/subcmd.js');

co(function *() {
  console.log('start');

  const config = require('./config');
  const args = commandArgs.parse();

  if (args.mode === 'push') {
    yield subcmd.startPush(config);
  } else if (args.mode === 'pull') {
    yield subcmd.startPull(config);
  } else if (args.mode === 'test') {
    yield subcmd.startTest(config);
  } else {
    throw new mError.Error(`unkown subcommand ${args.mode}.`);
  }
  console.log('end');

}).catch((err) => {
  if (mError.isError(err)){
    console.log(`ERROR!:${err.message}`);
  } else {
    console.log(`unkown ERROR!${err.type?':' + err.type:''}(${err.message})`);
    console.log(err.stack);
  }
});
