const chai = require('chai');
chai.use(require('chai-spies'));
const expect = chai.expect;

const random = require('../src/random');

describe('* PART I: random stuff, literally *', function () {

  const originalMathRandom = Math.random;
  afterEach(function () {
    Math.random = originalMathRandom;
  });

  describe('`random.integer`', function () {

    it('uses `Math.random`', function () {
      expect(random.integer).to.be.a('function');
      chai.spy.on(Math, 'random');
      random.integer(0,1000);
      expect(Math.random).to.have.been.called();
    });

    it('given a min and max, generates an integer betwixt them', function () {
      Math.random = function () {
        return 0;
      };
      expect(random.integer(0,10)).to.equal(0);
      Math.random = function () {
        return 0.99;
      };
      expect(random.integer(0,10)).to.equal(10);
      Math.random = function () {
        return 0.4;
      };
      expect(random.integer(0,10)).to.equal(4);
    });

    it('min defaults to zero', function () {
      Math.random = function () {
        return 0;
      };
      expect(random.integer(40)).to.equal(0);
      Math.random = function () {
        return 0.99;
      };
      expect(random.integer(40)).to.equal(40);
      Math.random = function () {
        return 0.25;
      };
      expect(random.integer(40)).to.equal(10);
    });

  });

  describe('`random.base64`', function () {

    it('utilizes `random.integer`', function () {
      expect(random.base64).to.be.a('function');
      chai.spy.on(random, 'integer');
      random.base64(16);
      expect(random.integer).to.have.been.called();
    });

    it('generates a string of the given size', function () {
      const randStr = random.base64(8);
      expect(randStr).to.be.a('string');
      expect(randStr).to.have.length(8);
      expect(random.base64(101)).to.have.length(101);
      expect(random.base64(58)).to.have.length(58);
    });

    it('generates a random sequence of characters from our base64 character set', function () {
      // make sure to utilize `base64._charSet` (which is already defined over in base64.js)
      const fakeVals = [4/64, 18/64, 8/64, 17/64, 15/64, 17/64, 20/64, 18/64];
      Math.random = function () {
        return fakeVals.pop();
      };
      // the assertion below may be a little over-specific
      // so if it fails but you are confident your random string generator is working in its own way
      // feel free to comment it out
      expect(random.base64(8)).to.equal('surprise');
    });

  });

  describe('middle-square method', function () {

    // -------------
    // *** BONUS ***
    // -------------

    // Make your own PSRNG using the middle-square method: https://en.wikipedia.org/wiki/Middle-square_method.

    it('`random.middleSquare` is an object', function () {
      expect(random.middleSquare).to.be.an('object');
    });

    it('`random.middleSquare.createGenerator` is a function that takes a seed (a string of decimal digits) and returns a random number generator (a function)', function () {
      expect(random.middleSquare.createGenerator).to.be.a('function');
      const prng = random.middleSquare.createGenerator('10');
      expect(prng).to.be.a('function');
    });

    describe('random number generator', function () {

      it('accepts no arguments and returns a string (of decimal digits)', function () {
        const prng = random.middleSquare.createGenerator('32');
        const result = prng();
        expect(result).to.be.a('string');
      });

      it('outputs a string that is always the same length as the seed', function () {
        for (let i = 1; i < 10; i++) {
          const seed = '9'.repeat(i);
          const prng = random.middleSquare.createGenerator(seed);
          const result = prng();
          expect(result.length).to.equal(seed.length);
        }
      });

      it('outputs the middle digits of its seed squared', function () {
        const prng = random.middleSquare.createGenerator('32');
        // 32 squared is 1024, the middle two digits are 02
        const num = prng();
        expect(num).to.equal('02');
      });

      it('uses the previous output as the next seed', function () {
        const prng = random.middleSquare.createGenerator('42');
        // 42 squared is 1764, the middle two digits are 76
        prng();
        // 76 squared is 5776, the middle two digits are 77
        const second = prng();
        expect(second).to.equal('77');
        // 77 squared is 5929, the middle two digits are 92
        const third = prng();
        expect(third).to.equal('92');
        // 92 squared is 8464, the middle two digits are 46
        const fourth = prng();
        expect(fourth).to.equal('46');
        // 46 squared is 2116, the middle two digits are 11
        const fifth = prng();
        expect(fifth).to.equal('11');
      });

      it('can pad left zeroes as needed to maintain the seed size', function () {
        const prng = random.middleSquare.createGenerator('03');
        // 3 squared is 9, the middle two digits are 09
        const num = prng();
        expect(num).to.equal('09');
      });

      it('can deal with odd digit lengths', function () {
        const prng = random.middleSquare.createGenerator('15');
        // 15 squared is 225, the middle two digits are 22 or 25
        const num = prng();
        expect(num).to.be.oneOf(['22', '25']);
      });

    });

  });

});
