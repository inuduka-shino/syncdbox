/*eslint no-console: 0 */

module.exports = (function () {
  'use strict';

  class MyError extends Error {
    constructor(message) {
      super(message);
    }
  }
  function isError(err) {
    return err instanceof MyError;
  }
  return {
    Error: MyError,
    isError: isError
  };
}());
