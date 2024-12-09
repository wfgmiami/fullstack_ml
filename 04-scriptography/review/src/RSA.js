const utils = require('./utils');
const ascii = require('./ascii');

const RSA = {};

RSA._selectKeyPair = function (primeA, primeB) {
  const n = primeA * primeB;
  const phiN = utils.totient(n, [primeA, primeB]);
  for (var e = 2; e < phiN; e++) {
    if (utils.gcd(e, phiN) === 1) {
      break;
    }
  }
  for (var d = phiN - 1; d > 1; d--) {
    if (e * d % phiN === 1) {
      break;
    }
  }
  return [e, d];
};

RSA.generateKeys = function (primeA, primeB) {
  const modulus = primeA * primeB;
  const [e, d] = RSA._selectKeyPair(primeA, primeB); // destructuring
  // equivalent to...
  // const keyPair = RSA._selectKeyPair(primeA, primeB);
  // const e = keyPair[0];
  // const d = keyPair[1];
  return {
    public: `${modulus}:${e}`,
    private: `${modulus}:${d}`
  };
};

RSA._asciiModExponent = function (key, asciiText) {
  const [modulus, exponent] = key.split(':').map(Number);
  const asciiDigits = ascii.toDigits(asciiText);
  const modExponentedDigits = asciiDigits.map(function (digit) {
    return utils.modularExponentiation(digit, exponent, modulus);
  });
  const modExponentedText = ascii.fromDigits(modExponentedDigits);
  return modExponentedText;
};

RSA.encrypt = function (key, asciiPlaintext) {
  const asciiCipher = RSA._asciiModExponent(key, asciiPlaintext);
  const base64Cipher = utils.asciiToBase64(asciiCipher);
  return base64Cipher;
};

RSA.decrypt = function (key, base64Cipher) {
  const asciiCipher = utils.base64ToAscii(base64Cipher);
  const asciiPlaintext = RSA._asciiModExponent(key, asciiCipher);
  return asciiPlaintext;
};

module.exports = RSA;
