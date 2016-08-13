/*eslint no-console: 0 */
'use strict';

module.exports = (function () {

  function genDBoxPackage() {
    return {
      rev: '00123'
    };
  }
  function genLocalPackage() {
    return {
      rev: '00003'
    };
  }
  function push() {
    console.log('called push');
  }
  function start(config) {
    console.log('hello. push.');
    console.dir(config);

    const rPackage = genDBoxPackage();
    const lPackage = genLocalPackage();

    if (rPackage.rev < lPackage.rev) {
      push();
    } else if (rPackage.rev === lPackage.rev) {
      throw new Error('revが等しいのでpushの必要がありません。');
    } else {
      throw new Error('revが古いので、pullしてください。');
    }

  }
  return {
    start: start
  };
}());
