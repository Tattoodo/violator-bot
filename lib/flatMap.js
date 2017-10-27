"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = arrayOfArrays => arrayOfArrays.reduce((acc, array) => acc.concat(array), []);