/*eslint no-console: 0 */
'use strict';

const
  co = require('co'),
  commandArgs = require('./lib/commandArgs'),
  mError = require('./lib/localError'),
  config = require('./config'),
  push = require('./lib/push.js'),
  pull = require('./lib/pull.js');

const x = new  mError.Error('test');
console.log(mError.isError(x));

co(function *(resolve, reject) {
  console.log('start');
  const args = commandArgs.parse();
  if (args.mode === 'push') {
    push.start(config);
  } else if (args.mode === 'pull') {
    pull.start(config);
  } else {
    reject(new mError.Error(`unkown subcommand ${args.mode}.`));
  }
  console.log('end');

}).catch((err) => {
  if (mError.isError(err)){
    console.log(`ERROR!:${err.message}`);
  } else {
    console.log(`unkown ERROR!${err.type?':' + err.type:''}(${err.message}`);
    console.log(err.stack);
  }
});
