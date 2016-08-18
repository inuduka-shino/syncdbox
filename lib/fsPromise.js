/*eslint no-console: 0 */
module.exports = (function () {
  'use strict';

  const
    fs = require('fs');

  function readFile(srcPath) {
    return new Promise((resolve, reject) => {
      try {
        fs.readFile(srcPath, (err, buff) => {
          if (err) {
            reject(err);
          } else {
            resolve(buff);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  function writeFile(dstPath, buff, opt) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFile(dstPath, buff, opt, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  function mkdir(path, mode) {
    return new Promise((resolve, reject) => {
      try {
        fs.mkdir(path, mode, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  function makeDirWhenNoDir(folderPath, mode) {
    return mkdir(folderPath, mode).catch((err) => {
      if (err.code === 'EEXIST') {
        return Promise.resolve('EXIST');
      } else {
        return Promise.reject(err);
      }
    });
  }
  function rmdir(path) {
    return new Promise((resolve, reject) => {
      try {
        fs.rmdir(path, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }


  function stat(path) {
    return new Promise((resolve, reject) => {
      fs.stat(path, (err, stats) => {
        if (err) {
          reject(err) ;
        } else {
          resolve(stats);
        }
      });
    });
  }

  function readdir(path, opt) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, opt, (err, files) => {
        if (err) {
          reject(err) ;
        } else {
          resolve(files);
        }
      });
    });
  }

  function unlink(path) {
    return new Promise((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) {
          reject(err) ;
        } else {
          resolve();
        }
      });
    });
  }

  function rmdirrf(targetPath) {
    const co = require('co'),
      path = require('path'),
      mError = require('./localError');

    return co(function *() {
      if (targetPath === undefined || targetPath === '') {
        throw new mError.Error('EBadPath', `パスが指定されていない(${targetPath}) 。`);
      }

      const files = yield readdir(targetPath);

      yield files.map((file)=>{
        //console.log(`file:${file}`);
        const filepath = path.join(targetPath, file);
        return stat(filepath).then((aStat) => {
          if (aStat.isFile()) {
            return unlink(filepath);
          } else if (aStat.isDirectory()) {
            return rmdirrf(filepath);
          } else {
            throw new mError.Error(`未対応ファイルタイプ：(${filepath})。`);
          }
        });
      });

      yield rmdir(targetPath);
    });
  }

  function rename(ptah1, path2) {
    return new Promise((resolve, reject) => {
      fs.rename(ptah1, path2, (err) => {
        if (err) {
          reject(err) ;
        } else {
          resolve();
        }
      });
    });
  }

  return {
    readFile,
    writeFile,
    mkdir,
    makeDirWhenNoDir,
    rmdir,
    rmdirrf,
    stat,
    readdir,
    rename,
    unlink
  };
}());
