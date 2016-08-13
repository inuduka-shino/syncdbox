/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
  const co = require('co');

  function start() {
    return co(function *(){
      console.log('hello. pull.');
      throw new Error('test error');
    });
  }
  return {
    start: start
  };
}());
