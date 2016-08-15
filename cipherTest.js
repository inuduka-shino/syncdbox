/*eslint no-console: 0 */
'use strict';

(function () {
  console.log('start');

  const crypto = require('crypto');
  const planeText =  '{"files":["test1.txt","test2.txt"]}';
  const passowrd = 'passw0rd';

  console.log('暗号化するテキスト : ' + planeText);
  console.log('暗号化キー        : ' + passowrd);

  // 暗号化
  const cipher = crypto.createCipher('aes192', passowrd);
  const cipheredText = cipher.update(planeText, 'ascii', 'binary') + cipher.final('binary');

  //console.log('暗号化(AES192) :');
  //console.log(cipheredText);

  // 復号
  const decipher = crypto.createDecipher('aes192', passowrd);
  const dec = decipher.update(cipheredText, 'binary', 'ascii') +  decipher.final('ascii');

  console.log('復号化(AES192) : ');
  console.log(dec);
  console.log('end');

}());
