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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var FILE_FILTER = /\.jsx?$/;

var cli = new _eslint2.default.CLIEngine({
  configFile: __dirname + '/../config/.eslintrc'
});

var filterFiles = function filterFiles(files) {
  return files.filter(function (file) {
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
  return function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file) {
      var content;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return fetchContent(file);

            case 2:
              content = _context.sent;
              return _context.abrupt('return', eslintMessages(content, file.filename).map(reviewMessage(file.filename, (0, _getLineMapFromPatchString2.default)(file.patch))).filter(function (review) {
                return !!review.position;
              }));

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }();
};

exports.default = function (fetchContent) {
  return function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(files) {
      var reviews;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              files = filterFiles(files);
              _context2.next = 3;
              return Promise.all(files.map(lint(fetchContent)));

            case 3:
              reviews = _context2.sent;
              return _context2.abrupt('return', (0, _flatMap2.default)(reviews));

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x2) {
      return _ref3.apply(this, arguments);
    };
  }();
};