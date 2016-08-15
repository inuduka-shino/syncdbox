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


  function* savePackages(packages) {
    const prmsArray = [];
    if (packages.length === 0) {
      throw new mError.Error('NoPackage', '該当するパッケージがありません。');
    }
    packages.forEach((pkg) => {
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

      console.log(`save Package:${pkg.packageName}`);
      absFiles.forEach((file) => {
        console.log(` ${file}`);
      });
    });
    yield Promise.all(prmsArray);
    console.log('saved package files.');
  }

  function* loadPackages(packages) {
    const prmsArray = [];
    if (packages.length === 0) {
      throw new mError.Error('NoPackage', '該当するパッケージがありません。');
    }
    packages.forEach((pkg) => {
      const shelterPackage = shelter.genPackage(pkg.packageName, pkg.solt);
      const loadTargetPath = (() => {
        if (pkg.loadTargetPath === undefined) {
          return pkg.targetPath;
        } else {
          return pkg.loadTargetPath;
        }
      })();
      prmsArray.push(co(function *() {
        const metaInfo = yield shelterPackage.readMetaInfo();
        const absFiles = metaInfo.files.map((file) => {
          return path.resolve(loadTargetPath, file);
        });

        console.log(`load Package:${pkg.packageName}`);
        absFiles.forEach((file) => {
          console.log(` ${file}`);
        });
        return shelterPackage.load(absFiles);
      }));
    });

    yield Promise.all(prmsArray);
    console.log('loaded Package files.');
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

      const packages = config.packages.filter((pkg) => {
        return pkg.packageName.indexOf('TEST') === 0;
      });

      shelter.init({
        shelterFolderPath: config.shelterFolderPath
      });

      yield * savePackages(packages);
      console.log('test(saved).');

      yield * loadPackages(packages);
      console.log('test finish.');

    }).catch((err) => {
      if (mError.isError(err) && err.code === 'NoPackage') {
        return Promise.reject(new mError.Error('Package[TEST]を定義してください。'));
      }
      return Promise.reject(err);
    });
  }

  return {
    startPull,
    startPush,
    startTest
  };
}());
