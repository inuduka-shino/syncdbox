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
    return Promise.all(files.map((file, index) => {
      solts.push('' + index);
      return zcrypto.zcryptoFile(file, path.join(remoteFolder,indexFilename(index)), zcrypto.genPW(solts));
    }));
  }
  function pull(remoteFolder, solts, files) {
    console.log('called pull');
    return Promise.all(files.map((file, index) => {
      solts.push('' + index);
      return zcrypto.unzcryptoFile(path.join(remoteFolder,indexFilename(index)), file, zcrypto.genPW(solts));
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
      const remotePath = config.dBoxPath;
      const codeSolt = 'RiO';

      yield Promise.all(config.packages.map((pkg) => {
        const pkgName = pkg.packageName;
        const targetPath = pkg.targetPath;
        const pkgSolt = pkg.solt;
        const remoteInfo = {
          files: []
        };
        const absFiles = pkg.files.map((file) => {
          const absPath = path.resolve(targetPath, file);
          remoteInfo.files.push(path.relative(targetPath, absPath));
          return absPath;
        });
        return Promise.all([
          push(path.join(remotePath, pkgName),  [codeSolt, pkgSolt], absFiles)
          //writeInfo(remoteInfo);
        ]);
      }));

      console.log('worte crypto files.');

      yield Promise.all(config.packages.map((pkg) => {
        const pkgName = pkg.packageName;
        const pkgSolt = pkg.solt;
        const absFiles = pkg.files.map((file) => {
          return path.resolve(path.join('work/uncrypto_test/',  pkgName) , file);
        });
        return pull(path.join(remotePath, pkgName),  [codeSolt, pkgSolt], absFiles);
      }));

      console.log('test finish.');
    });
  }

  return {
    start: start,
    test: test
  };
}());
