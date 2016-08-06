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
  const mode = opts.args()[0];

  console.log(mode);
  console.log('end');
}());
