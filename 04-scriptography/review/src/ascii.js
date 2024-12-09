const ascii = {};

ascii.toDigits = function (aStr) {
  const digits = [];
  for (let i = 0; i < aStr.length; i++) {
    const digit = aStr.charCodeAt(i) % 4096;
    digits.push(digit);
  }
  return digits;
};

ascii.fromDigits = function (digits) {
  let aStr = '';
  digits.forEach(function (digit) {
    aStr += String.fromCharCode(digit);
  });
  return aStr;
};

module.exports = ascii;
