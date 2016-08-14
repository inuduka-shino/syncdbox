/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
  const
    //mError = require('./localError'),
    fs = require('fs'),
    crypto = require('crypto'),
    zlib = require('zlib');

  function zcryptoFile(srcPath, dstPath, pw) {
    return new Promise((resolve, reject) => {
      console.log('call zcryptoFile');
      try{
        const cipher = crypto.createCipher('aes192', pw);
        const gzip = zlib.createGzip();
        const rstrm = fs.createReadStream(srcPath);
        const wstrm = fs.createWriteStream(dstPath);
        wstrm.on('finish', ()=>{
          console.log('zcryptoFile FINISH');
          resolve();
        });
        cipher.on('error', (err)=>{
          reject(err);
        });
        gzip.on('error', (err)=>{
          reject(err);
        });
        rstrm.on('error', (err)=>{
          reject(err);
        });
        wstrm.on('error', (err)=>{
          reject(err);
        });
        rstrm.pipe(cipher).pipe(gzip).pipe(wstrm);
      } catch(err) {
        reject(err);
      }
    });
  }

  function unzcryptoFile(srcPath, dstPath, pw) {
    return new Promise((resolve, reject) => {
      console.log('call unzcryptoFile');
      try{
        const decipher = crypto.createDecipher('aes192', pw);
        const gunzip = zlib.createGunzip();
        const rstrm = fs.createReadStream(srcPath);
        const wstrm = fs.createWriteStream(dstPath);
        wstrm.on('finish', ()=>{
          console.log('unzcryptoFile FINISH');
          resolve();
        });
        decipher.on('error', (err)=>{
          reject(err);
        });
        gunzip.on('error', (err)=>{
          reject(err);
        });
        rstrm.on('error', (err)=>{
          reject(err);
        });
        wstrm.on('error', (err)=>{
          reject(err);
        });
        rstrm.pipe(gunzip).pipe(decipher).pipe(wstrm);

      } catch(err) {
        reject(err);
      }
    });
  }
  function genPW(solts) {
    const sha512 = crypto.createHash('sha512');
    sha512.update(solts.join(''));
    return sha512.digest('hex');
  }
  return {
    zcryptoFile,
    unzcryptoFile,
    genPW
  };
}());
