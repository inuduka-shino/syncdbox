/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
  const opts = require('opts');
  opts.parse(
    [
      /*
      {
        long: 'pull',
        description: 'pull from dropbox'
      },
      {
        long: 'push',
        description: 'push to dropbox'
      }
      */
    ],
    true // for  Automatically generate help message
  );

  const mode = (() => {
    const mode = opts.args()[0];
    if (mode === undefined) {
      throw new Error('subcommand is none.');
    } else if (mode === 'push') {
      return 'push';
    } else if (mode === 'pull'){
      return 'pull';
    } else {
      throw new Error(`unkown subcommand: ${mode}.`);
    }
  })();

  return {
    mode: mode
  };
}());
