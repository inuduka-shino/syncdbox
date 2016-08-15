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

  return {
    readFile,
    writeFile,
    mkdir
  };
}());
