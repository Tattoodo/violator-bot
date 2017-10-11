"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (arrayOfArrays) {
  return arrayOfArrays.reduce(function (acc, array) {
    return acc.concat(array);
  }, []);
};