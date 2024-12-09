const base64 = require('./base64');

const random = {};

random.integer = function (min, max) {
  if (arguments.length < 2) {
    return random.integer(0, ...arguments);
  }
  const betweenZeroAndOne = Math.random();
  const betweenMinAndMax = min + betweenZeroAndOne * (max - min + 1);
  return Math.floor(betweenMinAndMax);
};

const charSet = base64._charSet;
random.base64 = function (length) {
  let str = '';
  while (length--) {
    const charIdx = random.integer(0, 63);
    str += charSet[charIdx];
  };
  return str;
};

random.middleSquare = {};

random.middleSquare.calculateNext = function (current) {
  const size = current.length;
  const squared = (current * current).toString();
  const start = (squared.length - size) / 2
  const middlePart = squared.substr(start, size);
  if (middlePart.length < size) {
    return '0'.repeat(size - middlePart.length) + middlePart;
  } else {
    return middlePart;
  }
};

random.middleSquare.createGenerator = function (seed) {
  return () => seed = this.calculateNext(seed);
};

module.exports = random;
