const chai = require('chai');
chai.use(require('chai-spies'));
const expect = chai.expect;

const utils = require('../src/utils');
const RSA = require('../src/RSA');

describe('* PART IV: going public *', function () {

  // HINT: check out http://imps.mcmaster.ca/courses/SE-4C03-07/wiki/wrighd/rsa_alg.html#Key_Generation_Algorithm
  // and keep in mind that for mathematical notation, `mod` is sometimes listed to the right of the *entire* equation
  // so something like `ed ≡ 1 (mod φ(n))` doesn't "convert" to `e * d == 1 % phi(n)`, it converts to `(e * d) % phi(n) == 1`

  describe('`RSA._selectKeyPair`', function () {

    it('utilizes `utils.totient`', function () {
      expect(RSA._selectKeyPair).to.be.a('function');
      chai.spy.on(utils, 'totient');
      RSA._selectKeyPair(11, 17);
      expect(utils.totient).to.have.been.called();
    });

    it('returns a pair of integers', function () {
      const pair = RSA._selectKeyPair(11, 17);
      expect(Number.isInteger(pair[0])).to.equal(true);
      expect(Number.isInteger(pair[1])).to.equal(true);
    });

    it('given two primes that multiply to n, returns a valid numerical pair (e, d) that satisfies [ xᵉᵈ % n = x ] for any x', function () {
      const pair = RSA._selectKeyPair(11, 17);
      const phiN = utils.totient(187, [11, 17]);
      expect(pair[0] * pair[1] % phiN).to.equal(1);
    });

  });

  describe('`RSA.generateKeys`', function () {

    it('utilizes `RSA._selectKeyPair`', function () {
      expect(RSA.generateKeys).to.be.a('function');
      chai.spy.on(RSA, '_selectKeyPair');
      RSA.generateKeys(11, 17);
      expect(RSA._selectKeyPair).to.have.been.called();
    });

    it('given the seed of two primes, comes back with a public key and private key', function () {
      const keys = RSA.generateKeys(11, 17);
      expect(keys.public).to.be.a('string');
      expect(keys.private).to.be.a('string');
    });

    it('each key is in turn composed of two parts, the variable part used for exponentiation and the constant part used as the modulus', function () {
      const keys = RSA.generateKeys(11, 17);
      const publicPieces = keys.public.split(':');
      const privatePieces = keys.private.split(':');
      expect(publicPieces[0]).to.equal(privatePieces[0]);
      expect(publicPieces[1]).to.not.equal(privatePieces[1]);
    });

    it('the constant part of either key is calculated by multiplying the two given primes', function () {
      const keys = RSA.generateKeys(11, 17);
      const publicConstant = keys.public.split(':')[0];
      const privateConstant = keys.private.split(':')[0];
      expect(parseInt(publicConstant)).to.equal(187);
      expect(parseInt(privateConstant)).to.equal(187);
    });

    it('the variable part of the public key corresponds to the smaller selected exponent', function () {
      const keys = RSA.generateKeys(11, 17);
      const publicVariable = keys.public.split(':')[1];
      const privateVariable = keys.private.split(':')[1];
      expect(parseInt(publicVariable)).to.be.lessThan(parseInt(privateVariable));
    });

  });

  describe('`RSA.encrypt`', function () {

    it('given a key and ASCII plaintext returns base64 ciphertext of the same *byte size*', function () {
      expect(RSA.encrypt).to.be.a('function');
      const keys = RSA.generateKeys(11, 17);
      // encryption using the public key
      const ciphertext1 = RSA.encrypt(keys.public, 'Message in a bottle');
      expect(ciphertext1).to.be.a('string');
      expect(utils.base64ToAscii(ciphertext1)).to.have.length(19);
      // encryption using the private key
      const ciphertext2 = RSA.encrypt(keys.private, 'Message in a bottle');
      expect(ciphertext2).to.be.a('string');
      expect(utils.base64ToAscii(ciphertext2)).to.have.length(19);
    });

    it('calculates ciphertext using modular exponentiation', function () {
      const keys = RSA.generateKeys(11, 17);
      chai.spy.on(utils, 'modularExponentiation');
      RSA.encrypt(keys.public, 'It does not really matter what this text is');
      expect(utils.modularExponentiation).to.have.been.called();
    });

  });

  describe('`RSA.decrypt`', function () {

    it('given a key and some base64 ciphertext returns ASCII plaintext of the same *byte size*', function () {
      expect(RSA.encrypt).to.be.a('function');
      const keys = RSA.generateKeys(11, 17);
      // decryption using the private key
      const plaintext1 = RSA.decrypt(keys.private, 'cb2beaeaXbwb2bRaFb5bRaXbRavaKbhahaqb2b');
      expect(plaintext1).to.be.a('string');
      expect(utils.asciiToBase64(plaintext1)).to.have.length(38);
      // decryption using the public key
      const plaintext2 = RSA.decrypt(keys.public, 'cbubDcDc9bjcubRaPa5bRa9bRavaKbbcbcEcub');
      expect(plaintext2).to.be.a('string');
      expect(utils.asciiToBase64(plaintext2)).to.have.length(38);
    });

    it('calculates plaintext using modular exponentiation', function () {
      const keys = RSA.generateKeys(11, 17);
      chai.spy.on(utils, 'modularExponentiation');
      RSA.decrypt(keys.private, 'It does not really matter what this text is');
      expect(utils.modularExponentiation).to.have.been.called();
    });

  });

  describe('is asymmetric', function () {

    let keys;
    beforeEach(function () {
      keys = RSA.generateKeys(11, 17);
    });

    it('only the private key can be used to decrypt messages encrypted with the public key', function () {
      const plaintext = 'A secret...clearly';
      const ciphertext = RSA.encrypt(keys.public, plaintext);
      expect(RSA.decrypt(keys.private, ciphertext)).to.equal(plaintext);
      expect(RSA.decrypt(keys.public, ciphertext)).to.not.equal(plaintext);
    });

    it('only the public key can be used to decrypt messages encrypted with the private key', function () {
      const plaintext = 'Dog\'s barking, can\'t fly without umbrella';
      const ciphertext = RSA.encrypt(keys.private, plaintext);
      expect(RSA.decrypt(keys.public, ciphertext)).to.equal(plaintext);
      expect(RSA.decrypt(keys.private, ciphertext)).to.not.equal(plaintext);
    });

  });

});
