/*eslint no-console: 0 */
'use strict';

const
  co = require('co'),
  commandArgs = require('./lib/commandArgs'),
  mError = require('./lib/localError');

co(function *() {
  console.log('start');

  const config = require('./config');
  const args = commandArgs.parse();

  if (args.mode === 'push') {
    const push = require('./lib/push.js');
    yield push.start(config);
  } else if (args.mode === 'pull') {
    const pull = require('./lib/pull.js');
    yield pull.start(config);
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
