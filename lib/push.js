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
  function test(config) {
    return co(function *() {
      console.log('hello. test.');
      console.dir(config);
      const
        files = ['work/target/test1.txt', 'work/target/test2.txt'],
        files2 = ['work/uncrypto_test/test1.txt', 'work/uncrypto_test/test2.txt'];

      yield push('work/dBox/smpl',  ['pass0'], files);
      yield pull('work/dBox/smpl', ['pass0'], files2);
      console.log('test finish.');
    });
  }

  return {
    start: start,
    test: test
  };
}());
