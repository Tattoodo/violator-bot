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

const FILE_FILTER = /\.css$/;

const CONFIG_FILE = `${__dirname}/../config/.stylelintrc`;

const filterFiles = files => files.filter(file => FILE_FILTER.test(file.filename));

const stylelintMessages = async (content, filename) => {
  const output = await _stylelint2.default.lint({
    code: content,
    codeFilename: filename,
    configFile: CONFIG_FILE
  });
  return output.results[0].warnings;
};

const reviewMessage = (filename, lineMap) => ({ line, rule, severity, text }) => ({
  path: filename,
  position: lineMap[line],
  body: `**${rule}**: ${text} [${severity}]`
});

const lint = fetchContent => async file => {
  const content = await fetchContent(file);
  const messages = await stylelintMessages(content, file.filename);
  return messages.map(reviewMessage(file.filename, (0, _getLineMapFromPatchString2.default)(file.patch))).filter(review => !!review.position);
};

exports.default = fetchContent => async files => {
  files = filterFiles(files);
  const reviews = await Promise.all(files.map(lint(fetchContent)));
  return (0, _flatMap2.default)(reviews);
};