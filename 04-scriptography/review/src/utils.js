const ascii = require('./ascii');
const base64 = require('./base64');

const utils = {};

utils.base64ToAscii = function (bStr) {
  const bDigits = base64.toDigits(bStr);
  const aDigits = [];
  for (let i = 0; i < bDigits.length; i+=2) {
    aDigits.push(bDigits[i] + 64 * (bDigits[i+1] || 0));
  }
  if (bDigits[bDigits.length-1] === 0) {
    aDigits.push(0);
  }
  return ascii.fromDigits(aDigits);
};

utils.asciiToBase64 = function (aStr) {
  const aDigits = ascii.toDigits(aStr);
  const bDigits = [];
  for (let i = 0; i < aDigits.length; i++) {
    bDigits.push(aDigits[i] % 64);
    bDigits.push(Math.floor(aDigits[i] / 64));
  }
  if (bDigits[bDigits.length-1] === 0) {
    bDigits.pop();
    if (bDigits[bDigits.length-1] === 0) {
      bDigits.pop();
    }
  }
  return base64.fromDigits(bDigits);
};

utils.modularExponentiation = function (base, exp, modulus) {
  const bits = exp.toString(2);
  let accum = 1;
  let x = base % modulus;
  for (let i = bits.length-1; i >= 0; i--) {
    if (bits[i] == '1') {
      accum *= x;
    }
    x = (x * x) % modulus;
  }
  return accum % modulus;
};

utils.primeFactors = function (n) {
  const end = Math.floor(Math.pow(n, 0.5));
  for (let i = 2; i <= end; i++) {
    if (n % i === 0) {
      return utils.primeFactors(i).concat(utils.primeFactors(n/i));
    }
  }
  return [n];
};

utils.totient = function (n, factors) {
  if (!factors) {
    factors = [];
    utils.primeFactors(n).forEach(function (factor) {
      if (factors.indexOf(factor) === -1) factors.push(factor);
    });
  }
  const numerator = factors.reduce(function (prod, factor) {
    return prod * (factor - 1);
  }, n);
  const denominator = factors.reduce(function (prod, factor) {
    return prod * factor;
  });
  return numerator / denominator;
};

utils.gcd = function (a, b) {
  const smaller = Math.min(a, b);
  const larger = Math.max(a, b);
  if (smaller === 0) return larger;
  return utils.gcd(smaller, larger % smaller);
};

module.exports = utils;
