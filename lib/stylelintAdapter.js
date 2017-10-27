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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var FILE_FILTER = /\.css$/;

var CONFIG_FILE = __dirname + '/../config/.stylelintrc';

var filterFiles = function filterFiles(files) {
  return files.filter(function (file) {
    return FILE_FILTER.test(file.filename);
  });
};

var stylelintMessages = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(content, filename) {
    var output;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _stylelint2.default.lint({
              code: content,
              codeFilename: filename,
              configFile: CONFIG_FILE
            });

          case 2:
            output = _context.sent;
            return _context.abrupt('return', output.results[0].warnings);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function stylelintMessages(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var reviewMessage = function reviewMessage(filename, lineMap) {
  return function (_ref2) {
    var line = _ref2.line,
        rule = _ref2.rule,
        severity = _ref2.severity,
        text = _ref2.text;
    return {
      path: filename,
      position: lineMap[line],
      body: '**' + rule + '**: ' + text + ' [' + severity + ']'
    };
  };
};

var lint = function lint(fetchContent) {
  return function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file) {
      var content, messages;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return fetchContent(file);

            case 2:
              content = _context2.sent;
              _context2.next = 5;
              return stylelintMessages(content, file.filename);

            case 5:
              messages = _context2.sent;
              return _context2.abrupt('return', messages.map(reviewMessage(file.filename, (0, _getLineMapFromPatchString2.default)(file.patch))).filter(function (review) {
                return !!review.position;
              }));

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  }();
};

exports.default = function (fetchContent) {
  return function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(files) {
      var reviews;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              files = filterFiles(files);
              _context3.next = 3;
              return Promise.all(files.map(lint(fetchContent)));

            case 3:
              reviews = _context3.sent;
              return _context3.abrupt('return', (0, _flatMap2.default)(reviews));

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    }));

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  }();
};