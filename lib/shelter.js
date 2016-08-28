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
  function genPW(solts) {
    return solts.join('-');
  }
  function save(packagePath, metaInfo, targetPath, files) {
    // TODO: solts -> metaInfo
    const fileinfos = files.map((file, index) => {
      const absPath = path.resolve(targetPath, file);
      const pw = genPW(metaInfo.solts.concat(index));
      return [absPath, pw];
    });
    metaInfo.fileInfos = fileinfos;
    return fileinfos.map((fileinfo, index) => {
      const absPath = fileinfo[0];
      const pw = fileinfo[1]; //
      return zcrypto.zcryptoFile(absPath, path.join(packagePath,indexFilename(index)), pw);
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
      metaInfo = {
        solts: [codeSolt, solt]
      },
      packagePath =  path.join(localShelterFolderPath, packageName),
      shelterPackagePath = path.join(shelterFolderPath, packageName);

    return {
      // TODO: solts -> metaInfo
      save: save.bind(null, packagePath, metaInfo),
      // TODO: solts -> metaInfo
      load: load.bind(null, packagePath, metaInfo),
      // TODO: solts -> metaInfo
      writeMetaInfo: writeMetaInfo.bind(null, packagePath, metaInfo),
      // TODO: solts -> metaInfo
      readMetaInfo: readMetaInfo.bind(null, packagePath, metaInfo),
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
