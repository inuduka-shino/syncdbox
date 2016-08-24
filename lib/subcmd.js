/*eslint no-console: 0 */

module.exports = (function () {
  'use strict';
  const
    co = require('co'),
    path = require('path'),
    fsPromise = require('./fsPromise'),
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

  function makeDirWhenNoDir(folderPath) {
    return fsPromise.mkdir(folderPath).catch((err) => {
      if (err.code === 'EEXIST') {
        return Promise.resolve('EXIST');
      } else {
        return Promise.reject(err);
      }
    });
  }

  function savePackages(packages) {
    if (packages.length === 0) {
      throw new mError.Error('NoPackage', '該当するパッケージがありません。');
    }
    return Promise.all(packages.map((pkg) => {
      let filePaths;
      return co(function *() {
        const shelterPackage = shelter.genPackage(pkg.packageName, pkg.solt);
        const targetPath = pkg.targetPath;

        yield shelterPackage.clearDir();
        const absPaths = yield shelterPackage.save(targetPath, pkg.files);

        yield shelterPackage.writeMetaInfo({
          files: filePaths = absPaths.map((absPath) => {
            return path.relative(targetPath, absPath);
          })
        });
        yield shelterPackage.syncPush();
      }).then(() => {
        console.log(`saved Package:${pkg.packageName}`);
        filePaths.forEach((file) => {
          console.log(` ${file}`);
        });
      });
    }));
  }

  function loadPackages(packages) {
    if (packages.length === 0) {
      throw new mError.Error('NoPackage', '該当するパッケージがありません。');
    }
    return Promise.all(packages.map((pkg) => {
      const shelterPackage = shelter.genPackage(pkg.packageName, pkg.solt);
      const loadTargetPath = (() => {
        if (pkg.loadTargetPath === undefined) {
          return pkg.targetPath;
        } else {
          return pkg.loadTargetPath;
        }
      })();
      return co(function *() {
        yield pkg.syncPull();
        const metaInfo = yield shelterPackage.readMetaInfo();
        const absFiles = metaInfo.files.map((file) => {
          return path.resolve(loadTargetPath, file);
        });

        yield makeDirWhenNoDir(loadTargetPath);
        yield shelterPackage.load(absFiles);
        return absFiles;
      }).then((absFiles) =>{
        console.log(`load Package:${pkg.packageName}`);
        absFiles.forEach((file) => {
          console.log(` ${file}`);
        });
      });
    }));
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
      const param = {
        shelterFolderPath: config.shelterFolderPath,
        localShelterFolderPath: config.localShelterFolderPath
      };

      shelter.init(param);

      const packages = config.packages.filter((pkg) => {
        return pkg.packageName.indexOf('TEST') === 0;
      });

      yield ['shelterFolderPath', 'localShelterFolderPath'].map((key) => {
        return makeDirWhenNoDir(param[key]);
      });

      yield savePackages(packages, param);

      console.log('test(saved).');

      yield loadPackages(packages, param);
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
