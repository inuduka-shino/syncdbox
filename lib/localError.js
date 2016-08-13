/*eslint no-console: 0 */
'use strict';

module.exports = (function () {
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
