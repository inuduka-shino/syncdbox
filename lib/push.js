/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
  const
    co = require('co'),
    mError = require('./localError'),
    zcrypto = require('./zcrypto');

  function genDBoxPackage() {
    return {
      rev: '00123'
    };
  }
  function genLocalPackage() {
    return {
      rev: '01003'
    };
  }
  function push() {
    console.log('called push');
    return zcrypto.zcryptoFile('work/test.txt', 'work/test_cipher.txt', 'passwr0d').then(
      zcrypto.unzcryptoFile.bind(null, 'work/test_cipher.txt', 'work/test_decipher.txt', 'passwr0d')
    );
  }

  function start(config) {
    return co(function *() {
      console.log('hello. push.');
      console.dir(config);

      const rPackage = yield genDBoxPackage();
      const lPackage = yield genLocalPackage();

      if (rPackage.rev < lPackage.rev) {
        yield push();
        console.log('push finish.');
      } else if (rPackage.rev === lPackage.rev) {
        throw new mError.Error('revが等しいのでpushの必要がありません。');
      } else {
        throw new mError.Error('revが古いので、pullしてください。');
      }
    });
  }
  return {
    start: start
  };
}());
