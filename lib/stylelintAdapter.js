'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stylelint = require('stylelint');

var _stylelint2 = _interopRequireDefault(_stylelint);

var _getLineMapFromPatchString = require('./getLineMapFromPatchString');

var _getLineMapFromPatchString2 = _interopRequireDefault(_getLineMapFromPatchString);

var _flatMap = require('./flatMap');

var _flatMap2 = _interopRequireDefault(_flatMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FILE_FILTER = /\.css$/;

var filterFiles = function filterFiles(files) {
  return files.filter(function (_ref) {
    var filename = _ref.filename;
    return filename.match(FILE_FILTER);
  });
};

var stylelintMessages = function stylelintMessages(content, filename) {
  return _stylelint2.default.lint({
    code: content,
    codeFilename: filename
  }).then(function (_ref2) {
    var warnings = _ref2.results.warnings;
    return warnings;
  });
};

var reviewMessage = function reviewMessage(filename, lineMap) {
  return function (_ref3) {
    var line = _ref3.line,
        rule = _ref3.rule,
        severity = _ref3.severity,
        text = _ref3.text;
    return {
      path: filename,
      position: lineMap[line],
      body: '**' + rule + '**: ' + text + ' [' + severity + ']'
    };
  };
};

var lint = function lint(fetchContent) {
  return function (file) {
    return fetchContent(file).then(function (content) {
      return stylelintMessages(content, file.filename);
    }).then(function (messages) {
      return messages.map(reviewMessage(file.filename, (0, _getLineMapFromPatchString2.default)(file.patch))).filet(function (review) {
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