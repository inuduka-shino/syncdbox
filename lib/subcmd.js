/*eslint no-console: 0 */

module.exports = (function () {
  'use strict';
  const
    co = require('co'),
    path = require('path'),
    mError = require('./localError'),
    shelter = require('./shelter');

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



  function startPull(config) {
    return co(function *() {
      console.log('PULL subcommand start.');
      console.dir(config);
    });
  }
  function startPush(config) {
    return co(function *() {
      console.log('PUSH subcommand start.');
      console.dir(config);

      const rPackage = yield genDBoxPackage();
      const lPackage = yield genLocalPackage();

      if (rPackage.rev < lPackage.rev) {
        //yield push();
        console.log('push finish.');
      } else if (rPackage.rev === lPackage.rev) {
        throw new mError.Error('revが等しいのでpushの必要がありません。');
      } else {
        throw new mError.Error('revが古いので、pullしてください。');
      }
    });
  }

  function startTest(config) {
    return co(function *() {
      console.log('test subcommand start.');

      shelter.init({
        shelterFolderPath: config.shelterFolderPath
      });

      {
        const prmsArray = [];
        config.packages.forEach((pkg) => {
          const shelterPackage = shelter.genPackage(pkg.packageName, pkg.solt);
          const targetPath = pkg.targetPath;
          const metaInfo = {
            files: []
          };
          const absFiles = pkg.files.map((file) => {
            const absPath = path.resolve(targetPath, file);
            metaInfo.files.push(path.relative(targetPath, absPath));
            return absPath;
          });
          prmsArray.push(shelterPackage.save(absFiles));
          prmsArray.push(shelterPackage.writeMetaInfo(metaInfo));
        });

        yield Promise.all(prmsArray);

        console.log('save crypto files.');
      }

      {
        const prmsArray = [];

        config.packages.forEach((pkg) => {
          const shelterPackage = shelter.genPackage(pkg.packageName, pkg.solt);
          prmsArray.push(co(function *() {
            const metaInfo = yield shelterPackage.readMetaInfo();
            const absFiles = metaInfo.files.map((file) => {
              console.log(file);
              return path.resolve(path.join('work/uncrypto_test/',  pkg.packageName) , file);
            });
            return shelterPackage.load(absFiles);
          }));
        });

        yield Promise.all(prmsArray);
        console.log('load crypto files.');
      }

      console.log('test finish.');
    });
  }

  return {
    startPull,
    startPush,
    startTest
  };
}());
