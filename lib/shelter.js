/*eslint no-console: 0 */
module.exports = (function () {
  'use strict';
  const
    path = require('path'),
    co = require('co'),
    zcrypto = require('./zcrypto'),
    fsPromise = require('./fsPromise'),
    //mError = require('./localError'),
    codeSolt = 'RiO';
  let
    shelterFolderPath,
    localShelterFolderPath;

  function init(param) {
    shelterFolderPath = param.shelterFolderPath;
    localShelterFolderPath = param.localShelterFolderPath;
  }

  function indexFilename(index) {
    return 'F' + ('00000' + index).slice(-6);
  }
  function metaFilename(packagePath) {
    return path.join(packagePath, 'M000000');
  }

  function writeMetaInfo(packagePath, solts, metaInfo) {
    return zcrypto.saveFile(metaFilename(packagePath), solts, JSON.stringify(metaInfo));
  }

  function readMetaInfo(packagePath, solts) {
    return zcrypto.loadFile(metaFilename(packagePath), solts).then((jsonStr) => {
      return JSON.parse(jsonStr);
    });
  }

  function save(packagePath, solts, targetPath, files) {
    const absFiles = files.map((file) => {
      const absPath = path.resolve(targetPath, file);
      return absPath;
    });
    return Promise.all(absFiles.map((file, index) => {
      return zcrypto.zcryptoFile(file, path.join(packagePath,indexFilename(index)), solts.concat(index));
    })).then(() => {
      return absFiles;
    });
  }

  function load(packagePath, solts, files) {
    return Promise.all(files.map((file, index) => {
      return zcrypto.unzcryptoFile(path.join(packagePath,indexFilename(index)), file, solts.concat(index));
    }));
  }

  function folderPath(packagePath) {
    return packagePath;
  }
  function clearDir(packagePath) {
    return co(function *() {
      yield fsPromise.rmdirrf(packagePath);
      yield fsPromise.mkdir(packagePath);
    });
  }
  function syncPush(packagePath, shelterPackagePath) {
    return co(function *() {
      const sppStat = yield fsPromise.makeDirWhenNoDir(shelterPackagePath);
      const srcfiles = yield fsPromise.readdir(packagePath);
      if (sppStat === 'EXIST') {
        const oldFiles = yield fsPromise.readdir(shelterPackagePath);
        yield oldFiles.filter((oldfile) => {
          return srcfiles.indexOf(oldfile) === -1;
        }).map((oldfile) => {
          return fsPromise.unkink(oldfile);
        });
      }
      yield srcfiles.map(
        (file) => {
          return fsPromise.renameOrMove(
            path.join(packagePath, file), path.join(shelterPackagePath, file)
          );
        }
      );

    });
  }
  function syncPull(packagePath, shelterPackagePath) {
    return co(function *() {
      yield fsPromise.rmdirrf(packagePath);
      yield fsPromise.mkdir(packagePath);
      const srcfiles = yield fsPromise.readdir(shelterPackagePath);
      yield srcfiles.map(
        (file) => {
          return fsPromise.copy(
            path.join(shelterPackagePath, file), path.join(packagePath, file)
          );
        }
      );

    });
  }
  function genPackage(packageName, solt) {
    const
      solts = [codeSolt, solt],
      packagePath =  path.join(localShelterFolderPath, packageName),
      shelterPackagePath = path.join(shelterFolderPath, packageName);

    return {
      save: save.bind(null, packagePath, solts),
      load: load.bind(null, packagePath, solts),
      writeMetaInfo: writeMetaInfo.bind(null, packagePath, solts),
      readMetaInfo: readMetaInfo.bind(null, packagePath, solts),
      folderPath: folderPath.bind(null, packagePath),
      clearDir: clearDir.bind(null, packagePath),
      syncPush: syncPush.bind(null, packagePath, shelterPackagePath),
      syncPull: syncPull.bind(null, packagePath, shelterPackagePath)
    };
  }

  return {
    init,
    genPackage
  };
}());
