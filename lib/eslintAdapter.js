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

var FILE_FILTER = /.*(.js|.jsx)$/;

var cli = new _eslint2.default.CLIEngine();

var filterFiles = function filterFiles(files) {
  return files.filter(function (_ref) {
    var filename = _ref.filename;
    return filename.match(FILE_FILTER);
  });
};

var eslintMessages = function eslintMessages(content, filename) {
  return cli.executeOnText(content, filename).results[0].messages;
};

var reviewMessage = function reviewMessage(filename, lineMap) {
  return function (_ref2) {
    var ruleId = _ref2.ruleId,
        message = _ref2.message,
        line = _ref2.line;
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
      return eslintMessages(contents, file.filename).map(reviewMessage(file.filename, (0, _getLineMapFromPatchString2.default)(file.patch))).filet(function (review) {
        return review.position;
      });
    });
  };
};

exports.default = function (fetchContent) {
  return function (files) {
    return Promise.all(filterFiles(files).map(lint(fetchContent))).then(_flatMap2.default);
  };
};