'use strict';

const crypto = require('crypto');

/**
 * Hey, does that 'getSha1' method on this object look weird?
 * It's enhanced object method notation!
 * Instead of saying:
 *
 * const someObj = {
 *   foo: function () {
 *      console.log('Hello world!');
 *   }
 * }
 *
 * ...we can shorten it to:
 *
 * const someObj = {
 *   foo () {
 *     console.log('Hello world!');
 *   }
 * }
 */

module.exports = {
  getSha1 (data) {
    return crypto
      .createHash('sha1')
      .update(data)
      .digest('hex');
  }
};
