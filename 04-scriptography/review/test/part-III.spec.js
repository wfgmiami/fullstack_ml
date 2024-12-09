const chai = require('chai');
chai.use(require('chai-spies'));
const expect = chai.expect;

const utils = require('../src/utils');
const random = require('../src/random');
const CSC = require('../src/CSC');
const OTP = require('../src/OTP');

describe('* PART III: encyrption conniption *', function () {

  describe('Caesar shift cipher', function () {

    describe('`CSC.generateKey`', function () {

      const originalMathRandom = Math.random;
      afterEach(function () {
        Math.random = originalMathRandom;
      });

      it('is different each time', function () {
        expect(CSC.generateKey).to.be.a('function');
        // technically this assertion will very infrequently fail even if you do everything correctly
        expect(CSC.generateKey()).to.not.equal(CSC.generateKey());
      });

      it('generates a random integer from 1 to 4095 (one less than the size of our ASCII alphabet)', function () {
        chai.spy.on(random, 'integer');
        expect(CSC.generateKey()).to.be.a('number');
        expect(random.integer).to.have.been.called();
        Math.random = function () {
          return 0;
        };
        expect(CSC.generateKey()).to.equal(1);
        Math.random = function () {
          return 0.99999;
        };
        expect(CSC.generateKey()).to.equal(4095);
      });

    });

    describe('`CSC.encrypt`', function () {

      it('given a key and ASCII plaintext returns base64 ciphertext of the same *byte size*', function () {
        expect(CSC.encrypt).to.be.a('function');
        const ciphertext = CSC.encrypt(300, 'how now brown cow?');
        expect(ciphertext).to.be.a('string');
        expect(utils.base64ToAscii(ciphertext)).to.have.length(18);
      });

      it('offsets the resulting ciphertext by the key', function () {
        // HINT: make sure to shift the original ASCII text *before* converting to base64
        const ciphertext1 = CSC.encrypt(1, 'aAxfoo');
        expect(utils.base64ToAscii(ciphertext1)).to.equal('bBygpp');
        const ciphertext2 = CSC.encrypt(4, 'FULLSTACKhoorah');
        expect(utils.base64ToAscii(ciphertext2)).to.equal('JYPPWXEGOlssvel');
      });

    });

    describe('`CSC.decrypt`', function () {

      it('given a key and some base64 ciphertext returns ASCII plaintext of the same *byte size*', function () {
        expect(CSC.decrypt).to.be.a('function');
        const ciphertext = utils.asciiToBase64('the quick brown fox jumps over the lazy dog');
        const plaintext = CSC.decrypt(158, ciphertext);
        expect(plaintext).to.be.a('string');
        expect(plaintext).to.have.length(43);
      });

      it('de-offsets the resulting plaintext by the key', function () {
        const ciphertext1 = utils.asciiToBase64('mellow');
        const plaintext1 = CSC.decrypt(1, ciphertext1);
        expect(plaintext1).to.equal('ldkknv');
        const ciphertext2 = utils.asciiToBase64('ThAnks...');
        const plaintext2 = CSC.decrypt(4, ciphertext2);
        expect(plaintext2).to.equal('Pd=jgo***');
      });

    });

    describe('is symmetric', function () {

      it('decrypt comes back with what encrypt started with', function () {
        const original = 'This is incredible right?';
        const cloned = CSC.decrypt(589, CSC.encrypt(589, original));
        expect(cloned).to.equal(original);
      });

      it('fails to decrypt with the wrong key', function () {
        const original = 'How about that?';
        const cloned = CSC.decrypt(123, CSC.encrypt(456, original));
        expect(cloned).to.not.equal(original);
      });

    });

  });

  describe('one time pad', function () {

    describe('`OTP.generateKey`', function () {

      it('is different each time', function () {
        expect(OTP.generateKey).to.be.a('function');
        expect(OTP.generateKey(16)).to.not.equal(OTP.generateKey(16));
      });

      it('produces a random base64 string of the given length', function () {
        chai.spy.on(random, 'base64');
        const key = OTP.generateKey(4);
        expect(random.base64).to.have.been.called();
        expect(key).to.be.a('string');
        expect(key).to.have.length(4);
      });

    });

    describe('`OTP.encrypt`', function () {

      let key;
      beforeEach(function () {
        // an example key to work with, 64 characters long
        key = 'bBM4byLnS7yTy6Vwhl578dAulQ7wrss3RtUJhzIR_xqnuPGOxOlzLdWfMmS1d2xb';
      });

      it('given a key and ASCII plaintext returns base64 ciphertext of the same *byte size*', function () {
        expect(OTP.encrypt).to.be.a('function');
        // NOTE: the key might be larger than the plaintext, simply don't use the whole key
        const ciphertext = OTP.encrypt(key, 'Message in a bottle');
        expect(ciphertext).to.be.a('string');
        expect(utils.base64ToAscii(ciphertext)).to.have.length(19);
      });

      it('uses XOR to produce a noisy result', function () {
        const plaintext = 'A humorous but secret message';
        const ciphertext = OTP.encrypt(utils.asciiToBase64(plaintext), plaintext);
        expect(ciphertext).to.be.a('string');
        for (let i = 0; i < ciphertext.length; i++) {
          // any number XORed with itself outputs 0, e.g. 1034 ^ 1034 === 0, and 0 corresponds to base64 character 'a', so we get all 'a's
          expect(ciphertext[i]).to.equal('a');
        }
        // totally different example
        expect(OTP.encrypt(key, 'Good job so far')).to.equal('gAj5Uzbmm7YS37nxNlk6tc6uTRAxJt');
      });

    });

    describe('`OTP.decrypt`', function () {

      let key;
      beforeEach(function () {
        // an example key to work with, 64 characters long
        key = 'bBM4byLnS7yTy6Vwhl578dAulQ7wrss3RtUJhzIR_xqnuPGOxOlzLdWfMmS1d2xb';
      });

      it('given a key and some base64 ciphertext returns ASCII plaintext of the same *byte size*', function () {
        expect(OTP.decrypt).to.be.a('function');
        // NOTE: the key might be larger than the ciphertext, simply don't use the whole key
        const plaintext = OTP.decrypt(key, 'mAd5Yzwmn6$S97pwUkx6Cd7vRQzx_tM2FscIIy');
        expect(plaintext).to.be.a('string');
        expect(utils.asciiToBase64(plaintext)).to.have.length(38);
      });

      it('uses XOR to unscramble the ciphertext', function () {
        const ciphertext = '1u32f1kjf';
        const plaintext = OTP.decrypt(ciphertext, ciphertext);
        expect(plaintext).to.be.a('string');
        for (let i = 0; i < plaintext.length; i++) {
          expect(plaintext.charCodeAt(i)).to.equal(0);
        }
        // totally different example
        expect(OTP.decrypt(key, 'gAj5Uzbmm7YS37nxNlk6tc6uTRAxJt')).to.equal('Good job so far');
      });

    });

    describe('is symmetric', function () {

      it('decrypt comes back with what encrypt started with', function () {
        const key = OTP.generateKey(16);
        const original = 'Secretly';
        const cloned = OTP.decrypt(key, OTP.encrypt(key, original));
        expect(original).to.equal(cloned);
      });

      it('fails to decrypt with the wrong key', function () {
        const encryptionKey = OTP.generateKey(16);
        const wrongKey = OTP.generateKey(16);
        const original = 'Secretly';
        const cloned = OTP.decrypt(wrongKey, OTP.encrypt(encryptionKey, original));
        expect(cloned).to.not.equal(original);
      });

    });

  });

});
