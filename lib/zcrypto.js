/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
  const
    //mError = require('./localError'),
    fs = require('fs'),
    crypto = require('crypto'),
    zlib = require('zlib'),
    fsPromise = require('./fsPromise');

  function genPW(solts) {
    const sha512 = crypto.createHash('sha512');
    sha512.update(solts.join(''));
    return sha512.digest('hex');
  }

  function zcryptoFile(srcPath, dstPath, solts) {
    return new Promise((resolve, reject) => {
      console.log('call zcryptoFile');
      try{
        const cipher = crypto.createCipher('aes192', genPW(solts));
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

  function unzcryptoFile(srcPath, dstPath, solts) {
    return new Promise((resolve, reject) => {
      console.log('call unzcryptoFile');
      try{
        const decipher = crypto.createDecipher('aes192', genPW(solts));
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
  function saveFile(filepath, solts, buff) {
    const cipher = crypto.createCipher('aes192', genPW(solts));
    cipher.pause();
    const cipheredText  = Buffer.concat([
      cipher.update(buff),
      cipher.final()
    ]);
    /*
    cipherのバグ？
    update,final の output_encoding に 'binary'を指定しても、文字列が帰ってきてしまう。
    なにも指定しないと、Uint8Arrayが帰ってくる。この場合連結は'+'ではなくBuffer.concatを使う。
    console.log('cipheredText:'+ Object.prototype.toString.apply(cipheredText));
    {
      console.log('decode test');
      const decipher = crypto.createDecipher('aes192', genPW(solts));

      const decText = decipher.update(cipheredText) + decipher.final();
      console.log(`decText:${decText}`);
    }
    console.log('decode test end');
    console.log(typeof cipheredText );
    //console.log(Object.prototype.toString.apply(null, cipheredText));
    */
    return fsPromise.writeFile(filepath, cipheredText);
  }
  function loadFile(filepath, solts) {
    const decipher = crypto.createDecipher('aes192', genPW(solts));
    return fsPromise.readFile(filepath).then((buff) => {
      const decText = decipher.update(buff) +  decipher.final();
      //console.log(decText);
      return decText;
    });
  }
  return {
    zcryptoFile,
    unzcryptoFile,
    saveFile,
    loadFile
  };
}());
