const base64 = {};

base64._charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$';

base64.toDigits = function (bStr) {
  const digits = [];
  for (let i = 0; i < bStr.length; i++) {
    const digit = base64._charSet.indexOf(bStr[i]);
    digits.push(digit);
  }
  return digits;
};

base64.fromDigits = function (digits) {
  let bStr = '';
  digits.forEach(function (digit) {
    bStr += base64._charSet[digit];
  });
  return bStr;
};

module.exports = base64;
