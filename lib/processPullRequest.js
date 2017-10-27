'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _github = require('github');

var _github2 = _interopRequireDefault(_github);

var _flatMap = require('./flatMap');

var _flatMap2 = _interopRequireDefault(_flatMap);

var _eslintAdapter = require('./eslintAdapter');

var _eslintAdapter2 = _interopRequireDefault(_eslintAdapter);

var _stylelintAdapter = require('./stylelintAdapter');

var _stylelintAdapter2 = _interopRequireDefault(_stylelintAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var config = {
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_PASSWORD
};

Object.keys(config).forEach(function (key) {
  if (!config[key]) {
    console.error('Missing ' + key + ' config! Exiting...');
    process.exit(1);
  }
});

// Github configuration

var github = new _github2.default();

github.authenticate(Object.assign({ type: 'basic' }, config));

// Functions

var translatePayload = function translatePayload(_ref) {
  var organization = _ref.organization,
      repository = _ref.repository,
      number = _ref.number,
      pull_request = _ref.pull_request;
  return {
    owner: organization.login,
    repo: repository.name,
    number: number,
    commit_id: pull_request.head.sha
  };
};

var getFiles = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(owner, repo, number) {
    var response;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return github.pullRequests.getFiles({
              owner: owner,
              repo: repo,
              number: number
            });

          case 2:
            response = _context.sent;
            return _context.abrupt('return', response.data);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function getFiles(_x, _x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();

var makeContentFetcher = function makeContentFetcher(owner, repo, commit_id) {
  return function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file) {
      var response;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return github.repos.getContent({
                owner: owner,
                repo: repo,
                path: file.filename,
                ref: commit_id
              });

            case 2:
              response = _context2.sent;
              return _context2.abrupt('return', Buffer.from(response.data.content, 'base64').toString());

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x4) {
      return _ref3.apply(this, arguments);
    };
  }();
};

var processPullRequest = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref4) {
    var owner = _ref4.owner,
        repo = _ref4.repo,
        number = _ref4.number,
        commit_id = _ref4.commit_id;

    var fetchContent, files, _ref6, _ref7, eslintReviews, stylelintReviews, comments, review;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            fetchContent = makeContentFetcher(owner, repo, commit_id);
            _context3.next = 4;
            return getFiles(owner, repo, number);

          case 4:
            files = _context3.sent;
            _context3.next = 7;
            return Promise.all([(0, _eslintAdapter2.default)(fetchContent)(files), (0, _stylelintAdapter2.default)(fetchContent)(files)]);

          case 7:
            _ref6 = _context3.sent;
            _ref7 = _slicedToArray(_ref6, 2);
            eslintReviews = _ref7[0];
            stylelintReviews = _ref7[1];
            comments = eslintReviews.concat(stylelintReviews);

            if (!(comments.length === 0)) {
              _context3.next = 14;
              break;
            }

            return _context3.abrupt('return');

          case 14:
            review = {
              owner: owner,
              repo: repo,
              number: number,
              commit_id: commit_id,
              event: 'REQUEST_CHANGES',
              body: 'ESLint & stylelint violations found.',
              comments: comments
            };

            console.log('--- posting review:', review);
            return _context3.abrupt('return', github.pullRequests.createReview(review));

          case 19:
            _context3.prev = 19;
            _context3.t0 = _context3['catch'](0);

            console.error('=== something bad happened!!!', _context3.t0);

          case 22:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[0, 19]]);
  }));

  return function processPullRequest(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

exports.default = function (payload) {
  return processPullRequest(translatePayload(payload));
};