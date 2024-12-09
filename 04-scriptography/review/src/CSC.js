const random = require('./random');
const utils = require('./utils');
const ascii = require('./ascii');

const CSC = {};

CSC.generateKey = function () {
  return random.integer(1, 4095); // the size of our "ascii" alphabet
};

CSC._shiftAscii = function (shiftAmount, asciiText) {
  const asciiDigits = ascii.toDigits(asciiText);
  const shiftedDigits = asciiDigits.map(function (digit) {
    return (4096 + digit + shiftAmount) % 4096;
  });
  const shiftedText = ascii.fromDigits(shiftedDigits);
  return shiftedText;
};

CSC.encrypt = function (key, asciiPlaintext) {
  const asciiCipher = CSC._shiftAscii(key, asciiPlaintext);
  const base64Cipher = utils.asciiToBase64(asciiCipher);
  return base64Cipher;
};

CSC.decrypt = function (key, base64Cipher) {
  const asciiCipher = utils.base64ToAscii(base64Cipher);
  const asciiPlaintext = CSC._shiftAscii(-key, asciiCipher);
  return asciiPlaintext;
};

module.exports = CSC;
