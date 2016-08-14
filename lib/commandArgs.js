/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
  const
    opts = require('opts'),
    mError = require('./localError');
  let mode;


  function parse() {
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

    mode = (() => {
      const mode = opts.args()[0];
      if (mode === undefined) {
        throw new mError.Error('サブコマンドを指定してください.');
      } else if (mode === 'push') {
        return 'push';
      } else if (mode === 'pull'){
        return 'pull';
      } else if (mode === 'test'){
        return 'test';
      } else {
        throw new mError.Error(`不明なサブコマンドです: ${mode}。`);
      }
    })();

    return {
      mode
    };
  }
  return {
    parse
  };
}());
