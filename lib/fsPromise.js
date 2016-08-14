/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
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
        resolve(err);
      }
    });
  }

  return {
    readFile
  };
});
