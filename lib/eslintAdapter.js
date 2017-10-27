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

const FILE_FILTER = /\.jsx?$/;

const cli = new _eslint2.default.CLIEngine({
  configFile: `${__dirname}/../config/.eslintrc`
});

const filterFiles = files => files.filter(file => FILE_FILTER.test(file.filename));

const eslintMessages = (content, filename) => cli.executeOnText(content, filename).results[0].messages;

const reviewMessage = (filename, lineMap) => ({ ruleId, message, line }) => ({
  path: filename,
  position: lineMap[line],
  body: `**${ruleId}**: ${message}`
});

const lint = fetchContent => async file => {
  const content = await fetchContent(file);
  return eslintMessages(content, file.filename).map(reviewMessage(file.filename, (0, _getLineMapFromPatchString2.default)(file.patch))).filter(review => !!review.position);
};

exports.default = fetchContent => async files => {
  files = filterFiles(files);
  const reviews = await Promise.all(files.map(lint(fetchContent)));
  return (0, _flatMap2.default)(reviews);
};