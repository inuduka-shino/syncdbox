/*eslint no-console: 0 */
module.exports = (function () {
  'use strict';
  const
    path = require('path'),
    zcrypto = require('./zcrypto'),
    codeSolt = 'RiO';
  let shelterFolderPath;

  function init(param) {
    shelterFolderPath = param.shelterFolderPath;
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

  function save(packagePath, solts, files) {
    console.log('called save');

    return Promise.all(files.map((file, index) => {
      return zcrypto.zcryptoFile(file, path.join(packagePath,indexFilename(index)), solts.concat(index));
    }));
  }

  function load(packagePath, solts, files) {
    console.log('called pull');
    return Promise.all(files.map((file, index) => {
      return zcrypto.unzcryptoFile(path.join(packagePath,indexFilename(index)), file, solts.concat(index));
    }));
  }

  function genPackage(packageName, solt) {
    const
      solts = [codeSolt, solt],
      packagePath =  path.join(shelterFolderPath, packageName);

    return {
      save: save.bind(null, packagePath, solts),
      load: load.bind(null, packagePath, solts),
      writeMetaInfo: writeMetaInfo.bind(null, packagePath, solts),
      readMetaInfo: readMetaInfo.bind(null, packagePath, solts)
    };
  }
  return {
    init,
    genPackage
  };
}());
