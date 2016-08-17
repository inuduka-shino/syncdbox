/*eslint no-console: 0 */
/* eslint-env node, mocha */

(function () {
  'use strict';
  const
    assert = require('assert'),
    co = require('co'),
    fsPromise = require('../lib/fsPromise'),
    path = require('path'),

    testPath = 'work/test/test_rmdirrf/';

  function failNoReject() {
    throw new Error('Expected promise to be rejected but it was fulfilled');
  }

  function touch(filepath) {
    return fsPromise.writeFile(filepath, 'test');
  }


  function* _product(array1, array2) {
    for (const idx1 in array1) {
      for (const idx2 in array2) {
        yield [array1[idx1], array2[idx2]];
      }
    }
  }
  function product(array1, array2) {
    const retArray = [];
    for (const x of _product(array1, array2)) {
      retArray.push(x);
    }
    return retArray;
  }

  describe('fsPromsie', () => {
    describe('rmdirrf', () => {
      it('test rmdir', () => {
        return co(function * () {
          const targetdir = path.join(testPath, 'test_rmdir');
          yield fsPromise.makeDirWhenNoDir(targetdir);

          return fsPromise.rmdir(targetdir).then((ret) => {
            assert.equal(ret, undefined);
          });
        });
      });
      it('test rmdirrf bad path', () => {
        return fsPromise.rmdirrf().then(failNoReject, (err) => {
          assert.equal(err.code, 'EBadPath');
        });
      });

      it('test rmdirrf top dir', () => {
        return co(function * () {
          const targetPath = path.join(testPath, 'test_rmdirrf_top');
          const dirPaths = [targetPath];
          yield dirPaths.map((dirPath) => {
            return fsPromise.makeDirWhenNoDir(dirPath);
          });

          return fsPromise.rmdirrf(targetPath).then((ret) => {
            assert.equal(ret, undefined);
            return Promise.all(dirPaths.map((dirPath) => {
              return fsPromise.stat(dirPath).then(failNoReject, (err) =>{
                if (err.code === 'ENOENT') {
                  return true;
                }
                return Promise.reject(`フォルダが消えていない。(${dirPath})`);
              });
            }));
          });
        });
      });

      it('test rmdirrf direct files on top dir', () => {
        return co(function * () {
          const targetPath = path.join(testPath, 'test_rmdirrf_top_files');
          const dirPaths = [targetPath].concat([].map((dirPath)=>{
            return path.join(targetPath, dirPath);
          }));
          const filePaths = ['testfile', 'testfile.txt'].map((filepath) =>{
            return path.join(targetPath, filepath);
          });
          yield dirPaths.map((dirPath) => {
            return fsPromise.makeDirWhenNoDir(dirPath);
          });
          yield filePaths.map((filepath) => {
            return touch(filepath);
          });

          return fsPromise.rmdirrf(targetPath).then((ret) => {
            assert.equal(ret, undefined);
            return Promise.all(dirPaths.map((dirPath) => {
              return fsPromise.stat(dirPath).then(failNoReject, (err) =>{
                if (err.code === 'ENOENT') {
                  return true;
                }
                return Promise.reject(`フォルダが消えていない。(${dirPath})`);
              });
            }));
          });
        });
      });

      it('test rmdirrf sub dir', () => {
        return co(function * () {
          const targetPath = path.join(testPath, 'test_rmdirrf2');
          const dirPaths = [targetPath].concat(['subA'].map((dirPath)=>{
            return path.join(targetPath, dirPath);
          }));

          yield dirPaths.reduce((prePromise, dirPath) => {
            //console.log(`dirPath: ${dirPath}`);
            return prePromise.then(fsPromise.makeDirWhenNoDir.bind(fsPromise, dirPath, undefined));
          }, Promise.resolve());

          return fsPromise.rmdirrf(targetPath).then((ret) => {
            assert.equal(ret, undefined);
            return Promise.all(dirPaths.map((dirPath) => {
              return fsPromise.stat(dirPath).then(failNoReject, (err) =>{
                if (err.code === 'ENOENT') {
                  return true;
                }
                return Promise.reject(`フォルダが消えていない。(${dirPath})`);
              });
            }));
          });
        });
      });

      it('test rmdirrf sub & sub-sub dir & files', () => {
        return co(function * () {
          const targetPath = path.join(testPath, 'test_rmdirrf3');
          const dirPaths = [targetPath].concat(['subA1', 'subA1/subB1', 'subA1/subB2',  'subA1/subB2/subC', 'subA2', 'subA2/subB'].map((dirPath)=>{
            return path.join(targetPath, dirPath);
          }));
          const filePaths = product(dirPaths, ['testfile', 'testfile.txt']).map((fileS) =>{
            console.log(`fileS: ${fileS}`);
            return path.join(fileS[0], fileS[1]);
          });

          yield dirPaths.reduce((prePromise, dirPath) => {
            //console.log(`dirPath: ${dirPath}`);
            return prePromise.then(fsPromise.makeDirWhenNoDir.bind(fsPromise, dirPath));
          }, Promise.resolve());

          yield filePaths.map((filepath) => {
            return touch(filepath);
          });

          return fsPromise.rmdirrf(targetPath).then((ret) => {
            assert.equal(ret, undefined);
            return Promise.all(dirPaths.map((dirPath) => {
              return fsPromise.stat(dirPath).then(failNoReject, (err) =>{
                if (err.code === 'ENOENT') {
                  return true;
                }
                return Promise.reject(`フォルダが消えていない。(${dirPath})`);
              });
            }));
          });
        });
      });

    });
  });

}());
