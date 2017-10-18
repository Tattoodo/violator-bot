'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eslint = require('eslint');

var _eslint2 = _interopRequireDefault(_eslint);

var _getLineMapFromPatchString = require('./getLineMapFromPatchString');

var _getLineMapFromPatchString2 = _interopRequireDefault(_getLineMapFromPatchString);

var _flatMap = require('./flatMap');

var _flatMap2 = _interopRequireDefault(_flatMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FILE_FILTER = /\.jsx?$/;

var cli = new _eslint2.default.CLIEngine();

var filterFiles = function filterFiles(files) {
  return files.map(function (file) {
    console.log('--- eslint filter file:', file.filename, FILE_FILTER.test(file.filename));return file;
  }).filter(function (file) {
    return FILE_FILTER.test(file.filename);
  });
};

var eslintMessages = function eslintMessages(content, filename) {
  return cli.executeOnText(content, filename).results[0].messages;
};

var reviewMessage = function reviewMessage(filename, lineMap) {
  return function (_ref) {
    var ruleId = _ref.ruleId,
        message = _ref.message,
        line = _ref.line;
    return {
      path: filename,
      position: lineMap[line],
      body: '**' + ruleId + '**: ' + message
    };
  };
};

var lint = function lint(fetchContent) {
  return function (file) {
    return fetchContent(file).then(function (content) {
      console.log('--- eslint file:', file.filename);return content;
    }).then(function (content) {
      return eslintMessages(content, file.filename).map(function (message) {
        console.log('--- eslint message:', message);return message;
      }).map(reviewMessage(file.filename, (0, _getLineMapFromPatchString2.default)(file.patch))).filter(function (review) {
        return !!review.position;
      });
    });
  };
};

exports.default = function (fetchContent) {
  return function (files) {
    return Promise.all(filterFiles(files).map(lint(fetchContent))).then(_flatMap2.default);
  };
};