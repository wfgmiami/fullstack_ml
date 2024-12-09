const random = require('./random');
const utils = require('./utils');
const base64 = require('./base64');

const OTP = {};

OTP.generateKey = function (length) {
  return random.base64(length);
};

OTP._xorBase64 = function (key, base64Text) {
  const keyDigits = base64.toDigits(key);
  const base64Digits = base64.toDigits(base64Text);
  const xoredDigits = base64Digits.map(function (digit, idx) {
    return digit ^ keyDigits[idx];
  });
  const xoredText = base64.fromDigits(xoredDigits);
  return xoredText;
};

OTP.encrypt = function (key, asciiPlaintext) {
  const base64Plaintext = utils.asciiToBase64(asciiPlaintext);
  const base64Cipher = OTP._xorBase64(key, base64Plaintext);
  return base64Cipher;
};

OTP.decrypt = function (key, base64Cipher) {
  const base64Plaintext = OTP._xorBase64(key, base64Cipher);
  const asciiPlaintext = utils.base64ToAscii(base64Plaintext);
  return asciiPlaintext;
};

module.exports = OTP;
