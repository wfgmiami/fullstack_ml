const base64 = require('./base64');
const utils = require('./utils');

const hash = {};

hash.simple = {};

hash.simple._pad = function (str, length) {
  const reversed = str.split('').reverse().join('');
  let padded = str;
  while (padded.length < length) {
    padded += reversed;
  }
  return padded; // a string
};

hash.simple._partition = function (str, partitionSize) {
  const partitions = [];
  for (let i = 0; i < str.length; i += partitionSize) {
    partitions.push(str.substr(i, partitionSize));
  }
  return partitions; // an array
};

// the two incoming strings are base64
// the outgoing string is also base64
hash.simple._combine = function (strA, strB) {
  const longer = strA.length > strB.length ? strA : strB;
  const shorter = longer === strA ? strB : strA;
  const longerDigits = base64.toDigits(longer);
  const shorterDigits = base64.toDigits(shorter);
  const combinedDigits = longerDigits.map(function (digit, idx) {
    const otherDigit = shorterDigits[idx];
    return digit ^ otherDigit;
  });
  const combined = base64.fromDigits(combinedDigits);
  return combined; // str
};

// // incoming string is "ascii"
// // outgoing string is base64
// hash.simple.run = function (str, length) {
//   const base64Str = utils.asciiToBase64(str);
//   const padded = hash.simple._pad(base64Str, length * 2); // to make sure we have at least one combine
//   const partitions = hash.simple._partition(padded, length);
//   let digest = partitions[0];
//   for (let i = 1; i < partitions.length; i++) {
//     digest = hash.simple._combine(digest, partitions[i]);
//   }
//   return digest; // str
// };

// reduce
hash.simple.run = function (str, length) {
  const base64Str = utils.asciiToBase64(str);
  const padded = hash.simple._pad(base64Str, length * 2); // to make sure we have at least one combine
  const partitions = hash.simple._partition(padded, length);
  const digest = partitions.reduce(hash.simple._combine);
  return digest; // str
};

hash.hmac = function (hashingFn, key, message, length) {
  if (arguments.length < 4) {
    return hash.hmac(hash.simple.run, ...arguments);
  }
  return hashingFn(key + message, length);
};

hash.pbkdf2 = function (hashingFn, message, salt, iterations, length) {
  if (arguments.length < 5) {
    return hash.pbkdf2(hash.simple.run, ...arguments); // given arguments = [1,2,3] ~> hash.pbkdf2(hash.simple.run, 1, 2, 3)
  }
  let digest = message;
  while (iterations--) {
    digest = hash.hmac(hashingFn, salt, digest, length);
  }
  return digest;
};

// example use case
// somebody submits passowrd: p@ssword
// on our server we call
// var saltForThisUser = 'asidufjx1234';
// var hashedPassword = pbdkf2('sha256', 'p@ssword', saltForThisUser, 10000, 64);
// then we would save the salt and hashed password in the database for that user

module.exports = hash;
