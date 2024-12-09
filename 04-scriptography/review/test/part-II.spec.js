const chai = require('chai');
chai.use(require('chai-spies'));
const expect = chai.expect;

const base64 = require('../src/base64');
const utils = require('../src/utils');
const hash = require('../src/hash');

describe('* PART II: hashing it out *', function () {

  describe('`hash.simple._pad`', function () {

    it('increases the string to at least the given length', function () {
      expect(hash.simple._pad).to.be.a('function');
      const padded = hash.simple._pad('words', 10);
      expect(padded).to.be.a('string');
      expect(padded).to.have.length(10);
    });

    it('does so by concatenating the string to its reverse until it\'s big enough', function () {
      expect(hash.simple._pad('something', 18)).to.equal('somethinggnihtemos');
      // will go OVER the pad length
      expect(hash.simple._pad('foobar', 7)).to.equal('foobarraboof');
      // may have to do so multiple times
      expect(hash.simple._pad('abc', 21)).to.equal('abccbacbacbacbacbacba');
    });

  });

  describe('`hash.simple._partition`', function () {

    it('divides the string into n pieces, each of the given length', function () {
      expect(hash.simple._partition).to.be.a('function');
      expect(hash.simple._partition('abc', 1)).to.eql(['a', 'b', 'c']);
      expect(hash.simple._partition('somethinglongernow', 3)).to.eql(['som', 'eth', 'ing', 'lon', 'ger', 'now']);
    });

    it('the final string is the remainder, and may be less than the given length', function () {
      expect(hash.simple._partition('odd', 2)).to.eql(['od', 'd']);
      expect(hash.simple._partition('thishasanevennumberofletters', 5)).to.eql(['thish', 'asane', 'vennu', 'mbero', 'flett', 'ers']);
    });

  });

  describe('`hash.simple._combine`', function () {

    it('accepts two equal length base64 strings and returns one of the same length', function () {
      expect(hash.simple._combine).to.be.a('function');
      const combined = hash.simple._combine('foo', 'bar');
      expect(combined).to.be.a('string');
      expect(combined).to.have.length(3);
    });

    it('utilizes `base64.toDigits` and `base64.fromDigits`', function () {
      chai.spy.on(base64, 'toDigits');
      chai.spy.on(base64, 'fromDigits');
      hash.simple._combine('elephant', 'anteater');
      expect(base64.toDigits).to.have.been.called();
      expect(base64.fromDigits).to.have.been.called();
    });

    it('combines the strings by XORing their digits then converting them back to base64', function () {
      // read more about XOR here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
      // any number XORed with itself outputs 0, e.g. 1034 ^ 1034 === 0, and 0 corresponds to base64 character 'a', so we get all 'a's
      expect(hash.simple._combine('Tajikistan', 'Tajikistan')).to.equal('aaaaaaaaaa');
      // in order to pass these it's important that you copy the behavior we're expecting—if you get stuck ask for help!
      expect(hash.simple._combine('tommarvoloriddle', 'iamlordvoldemort')).to.equal('BoahoawBffsmpnAx');
    });

    it('if either string is smaller, it pads the end with the XOR identity value (the character\'s digit equivalent should be zero)', function () {
      // the "extra" part of the larger string should remain unchanged
      expect(hash.simple._combine('zebra', 'elephANT').slice(-3)).to.equal('ANT');
      expect(hash.simple._combine('zooMONSTERS', 'zoo')).to.equal('aaaMONSTERS');
    });

  });

  describe('`hash.simple.run`', function () {

    it('utilizes `utils.asciiToBase64` on the plaintext input', function () {
      expect(hash.simple.run).to.be.a('function');
      chai.spy.on(utils, 'asciiToBase64');
      hash.simple.run('this is some plain text', 8);
      expect(utils.asciiToBase64).to.have.been.called.with('this is some plain text');
    });

    it('utilizes `._pad`, `._partition`, and `._combine`', function () {
      chai.spy.on(hash.simple, '_pad');
      chai.spy.on(hash.simple, '_partition');
      chai.spy.on(hash.simple, '_combine');
      hash.simple.run('this is some plain text', 8);
      expect(hash.simple._pad).to.have.been.called();
      expect(hash.simple._partition).to.have.been.called();
      expect(hash.simple._combine).to.have.been.called();
      /* UNCOMMENT THE ASSERTIONS BELOW FOR VERY SPECIFIC GUIDANCE */
      // // pad size is double the expected hash string size: 16
      // expect(hash.simple._pad).to.have.been.called.with('0bObPbZbGaPbZbGaZbVbTbLbGaWbSbHbPbUbGa0bLb4b0b', 16);
      // expect(hash.simple._partition).to.have.been.called.with('0bObPbZbGaPbZbGaZbVbTbLbGaWbSbHbPbUbGa0bLb4b0b', 8);
      // // combine gets called on the first and second partition, then that result and the third partition, etc.
      // expect(hash.simple._combine).to.have.been.called.with('0bObPbZb', 'GaPbZbGa'); // combining these two should produce 'ubbaAatb'
      // expect(hash.simple._combine).to.have.been.called.with('ubbaAatb', 'ZbVbTbLb'); // which is the input here with the third partition, and should produce 'NaUb3b2a'
      // expect(hash.simple._combine).to.have.been.called.with('NaUb3b2a', 'GaWbSbHb'); // which is the input here with the fourth partition, and should produce 'haEaBaxb'
      // expect(hash.simple._combine).to.have.been.called.with('haEaBaxb', 'PbUbGa0b'); // etc...
      // expect(hash.simple._combine).to.have.been.called.with('UbWb7aJa', 'Lb4b0b');
    });

    it('converts an ASCII string (plaintext) to a hashed base64 string of the given length', function () {
      const hashedResult = hash.simple.run('I solemny swear I am up to no good', 10);
      expect(hashedResult).to.have.length(10);
      // this specific result is particular to our simple hashing algorithm
      // a different hashing algorithm would not produce the same hashed output
      expect(hashedResult).to.equal('xbjbPa9aha');
      // also works for when the hash length is longer than the plaintext string
      expect(hash.simple.run('shorty', 20)).to.equal('ZBODVqYg1Z4UarahalaB');
    });

  });

  describe('`hash.hmac`', function () {

    it('runs the given hashing algorithm using the secret key, plaintext, and given length', function () {
      expect(hash.hmac).to.be.a('function');
      const spy = chai.spy();
      hash.hmac(spy, 'tongiscool', 'a plain text message in here', 16);
      expect(spy).to.have.been.called();
    });

    it('defaults to using our simple hashing algorithm', function () {
      // keep in mind that the key should be prepended to the plaintext
      chai.spy.on(hash.simple, 'run');
      const hashedResult = hash.hmac('tongiscool', 'a plain text message in here', 16);
      expect(hash.simple.run).to.have.been.called();
      expect(hashedResult).to.equal('_bWbGbMa0bRbcaca');
    });

  });

  describe('`hash.pbkdf2`', function () {

    it('utilizes `hash.hmac` and given algorithm n times for n rounds', function () {
      chai.spy.on(hash, 'hmac');
      const spy = chai.spy();
      hash.pbkdf2(spy, 'plain old text you know?', 'NaCl', 9, 4);
      expect(hash.hmac).to.have.been.called();
      expect(spy).to.have.been.called();
      expect(hash.hmac).to.have.been.called.exactly(9);
      expect(spy).to.have.been.called.exactly(9);
    });

    it('produces a hashed result given a hashing algorithm, plaintext, salt, an amount of iterations, and an output size', function () {
      expect(hash.pbkdf2(hash.simple.run, 'p@ssword', 'amanaplanacanalpanama', 1000, 16)).to.equal('TbebGb2aUbqaaafa');
    });

    it('defaults to using our simple hashing algorithm', function () {
      chai.spy.on(hash.simple, 'run');
      hash.pbkdf2('p@ssword', 'amanaplanacanalpanama', 1000, 16);
      expect(hash.simple.run).to.have.been.called();
    });

  });

  /*

  # EXTRA CREDIT

  Implement a cryptographically secure hashing algorithm (and if so make it the default for `hmac` and `pbkdf2`).
  1. RC4 is probably "simplest" (!== "simple"): http://nullprogram.com/blog/2014/07/23/
  2. There's Blum-Micali: https://en.wikipedia.org/wiki/Blum%E2%80%93Micali_algorithm
  3. There's also the widely-used SHA1. If you're feeling brave...
    - You can find psuedocode on wikipedia: https://en.wikipedia.org/wiki/SHA-1#SHA-1_pseudocode.
    - Or perhaps check out this for a more detailed step-by-step: http://www.metamorphosite.com/one-way-hash-encryption-sha1-data-software.

  */

});
