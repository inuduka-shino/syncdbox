/*eslint no-console: 0 */
'use strict';
(function () {
  const opts = require('opts');
  console.log('start');

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
    } else if (mode === 'push'){
      return 'pull';
    } else {
      throw new Error(`unkown subcommand: ${mode}.`);
    }
  })();

  console.log(mode);
  console.log('end');

}());
