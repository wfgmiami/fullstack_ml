const chai = require('chai');
chai.use(require('chai-spies'));
const expect = chai.expect;

const ascii = require('../src/ascii');
const base64 = require('../src/base64');
const utils = require('../src/utils');

describe('* PREAMBLE *', function () {

  // These don't come into play until Part II)
  describe('there and back again, a string-encoding tale', function () {

    it('`ascii.toDigits`', function () {
      const digits = ascii.toDigits('helpful');
      expect(digits).to.eql([104, 101, 108, 112, 102, 117, 108]);
    });

    it('`ascii.fromDigits`', function () {
      const str = ascii.fromDigits([119, 104, 105, 115, 112, 101, 114, 115]);
      expect(str).to.equal('whispers');
    });

    it('`base64.toDigits`', function () {
      const digits = base64.toDigits('ax$B_32');
      expect(digits).to.eql([0, 23, 63, 27, 62, 55, 54]);
    });

    it('`base64.fromDigits`', function () {
      const str = base64.fromDigits([7, 8, 18, 54, 8, 15, 4]);
      expect(str).to.equal('his2ipe');
    });

    it('`utils.base64ToAscii` and `utils.asciiToBase64`', function () {
      const base64Encoding = utils.asciiToBase64('the quick brown fox jumps over the lazy dog');
      expect(base64Encoding).to.not.equal('the quick brown fox jumps over the lazy dog');
      expect(utils.base64ToAscii(base64Encoding)).to.equal('the quick brown fox jumps over the lazy dog');
      const asciiEncoding = utils.base64ToAscii('$1337_FoR_LiFe$');
      expect(asciiEncoding).to.not.equal('$1337_FoR_LiFe$');
      expect(utils.asciiToBase64(asciiEncoding)).to.equal('$1337_FoR_LiFe$');
    });

  });

  // These don't come into play until Part IV
  describe('mathy stuff that RSA needs', function () {

    describe('`utils.modularExponentiation`', function () {

      it('given a base an exponent and a modulus, comes back with a number', function () {
        expect(utils.modularExponentiation).to.be.a('function');
        expect(utils.modularExponentiation(2, 6, 10)).to.be.a('number');
      });

      it('without using `Math.pow`, calculates [ bˣ % m ] where b is the base, x is the exponent, and m is the modulus', function () {
        chai.spy.on(Math, 'pow');
        expect(utils.modularExponentiation(2, 6, 10)).to.equal(4); // 2⁵ => 32, 32 % 10 => 2
        expect(utils.modularExponentiation(7, 10, 100)).to.equal(49); // 7 ^ 10 => 282475249, 282475249 % 100 => 49
        expect(Math.pow).not.to.have.been.called();
        // the assertion below would be practically impossible to calculate "directly"
        expect(utils.modularExponentiation(9817523464, 1729341584, 1000)).to.equal(840);
      });

    });

    describe('`utils.primeFactors`', function () {

      it('calculates the prime factors of some number', function () {
        expect(utils.primeFactors).to.be.a('function');
        expect(utils.primeFactors(3)).to.eql([3]);
        expect(utils.primeFactors(49)).to.eql([7, 7]);
        expect(utils.primeFactors(1000)).to.eql([2,2,2,5,5,5]);
        expect(utils.primeFactors(72447)).to.eql([3,19,31,41]);
        expect(utils.primeFactors(131071)).to.eql([131071]);
      });

    });

    describe('`utils.totient`', function () {

      it('utilizes `utils.primeFactors`', function () {
        expect(utils.totient).to.be.a('function');
        chai.spy.on(utils, 'primeFactors');
        utils.totient(9);
        expect(utils.primeFactors).to.have.been.called();
      });

      it('calculates the number of digits less than or equal to n that share no factors with it', function () {
        expect(utils.totient(2)).to.equal(1);
        expect(utils.totient(36)).to.equal(12);
        expect(utils.totient(90)).to.equal(24);
        expect(utils.totient(541)).to.equal(540);
        expect(utils.totient(12345)).to.equal(6576);
      });

      it('if given the prime factors of n, will utilize them', function () {
        chai.spy.on(utils, 'primeFactors');
        expect(utils.totient(11, [11])).to.equal(10);
        expect(utils.totient(400, [2,5])).to.equal(160);
        expect(utils.totient(21706567, [5167, 4201])).to.equal(21697200);
        expect(utils.primeFactors).not.to.have.been.called();
      });

    });

    describe('`utils.gcd`', function () {

      it('calculates the greatest common divisor of anything and 0', function () {
        expect(utils.gcd(5,0)).to.equal(5);
        expect(utils.gcd(0,30)).to.equal(30);
      });

      it('calculates the greatest common divisor for arbitrary integers', function () {
        expect(utils.gcd(10, 40)).to.equal(10);
        expect(utils.gcd(18, 24)).to.equal(6);
        expect(utils.gcd(31, 49)).to.equal(1);
      });

    });

  });

});
