/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
  const
    co = require('co'),
    path = require('path'),
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
  function indexFilename(index) {
    return 'F' + ('00000' + index).slice(-6);
  }
  function push(remoteFolder, solts, files) {
    console.log('called push');
    console.log(`remoteFolder:${remoteFolder}`);
    const pw = solts.join('');
    return Promise.all(files.map((file, index) => {
      console.log(`targetFile:${file}`);
      return zcrypto.zcryptoFile(file, path.join(remoteFolder,indexFilename(index)), pw);
    }));
  }
  function pull(remoteFolder, solts, files) {
    console.log('called pull');
    const pw = solts.join('');
    return Promise.all(files.map((file, index) => {
      return zcrypto.unzcryptoFile(path.join(remoteFolder,indexFilename(index)), file, pw);
    }));
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
      console.log('test subcommand start.');

      yield Promise.all(config.packages.map((pkg) => {
        const pkgName = pkg.packageName;
        const targetPath = pkg.targetPath;
        const remotePath = config.dBoxPath;
        const absFiles = pkg.files.map((file) => {
          return path.resolve(targetPath, file);
        });
        return push(path.join(remotePath, pkgName),  ['pass0'], absFiles);
      }));

      console.log('worte crypto files.');

      yield Promise.all(config.packages.map((pkg) => {
        const pkgName = pkg.packageName;
        const remotePath = config.dBoxPath;
        const absFiles = pkg.files.map((file) => {
          return path.resolve(path.join('work/uncrypto_test/',  pkgName) , file);
        });
        return pull(path.join(remotePath, pkgName),  ['pass0'], absFiles);
      }));

      console.log('test finish.');
    });
  }

  return {
    start: start,
    test: test
  };
}());
