/*eslint no-console: 0 */

module.exports = (function () {
  'use strict';

  class MyError extends Error {
    constructor(code, message) {
      if (message === undefined) {
        message = code;
        code = undefined;
      }
      super(message);
      if (code !== undefined) {
        this.code = code;
      }
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
