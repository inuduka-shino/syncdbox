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
      return zcrypto.zcryptoFile(file, path.join(remoteFolder,indexFilename(index)), solts.concat(index));
    }));
  }
  function pull(remoteFolder, solts, files) {
    console.log('called pull');
    return Promise.all(files.map((file, index) => {
      return zcrypto.unzcryptoFile(path.join(remoteFolder,indexFilename(index)), file, solts.concat(index));
    }));
  }
  function writeMetaInfo(remotePkgPath, solts, metaInfo) {
    return zcrypto.saveFile(path.join(remotePkgPath, 'M000000'), solts, JSON.stringify(metaInfo));

  }
  function readMetaInfo(remotePkgPath, solts) {
    return zcrypto.loadFile(path.join(remotePkgPath, 'M000000'), solts).then((jsonStr) => {
      return JSON.parse(jsonStr);
    });

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
        const pkgSolts = [codeSolt, pkg.solt];
        const metaInfo = {
          files: []
        };
        const absFiles = pkg.files.map((file) => {
          const absPath = path.resolve(targetPath, file);
          metaInfo.files.push(path.relative(targetPath, absPath));
          return absPath;
        });
        const remotePkgPath = path.join(remotePath, pkgName);
        return Promise.all([
          push(remotePkgPath,  pkgSolts, absFiles),
          writeMetaInfo(remotePkgPath, pkgSolts, metaInfo)
        ]);
      }));

      console.log('worte crypto files.');

      yield Promise.all(config.packages.map((pkg) => {
        const pkgName = pkg.packageName;
        const pkgSolts = [codeSolt, pkg.solt];
        const remotePkgPath = path.join(remotePath, pkgName);

        return readMetaInfo(remotePkgPath, pkgSolts).then((metaInfo) => {
          const absFiles = metaInfo.files.map((file) => {
            return path.resolve(path.join('work/uncrypto_test/',  pkgName) , file);
          });
          return pull(path.join(remotePath, pkgName),  pkgSolts, absFiles);
        });
      }));

      console.log('test finish.');
    });
  }

  return {
    start: start,
    test: test
  };
}());
