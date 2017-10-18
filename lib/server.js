'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _processPullRequest = require('./processPullRequest');

var _processPullRequest2 = _interopRequireDefault(_processPullRequest);

var _eslintAdapter = require('./eslintAdapter');

var _eslintAdapter2 = _interopRequireDefault(_eslintAdapter);

var _stylelintAdapter = require('./stylelintAdapter');

var _stylelintAdapter2 = _interopRequireDefault(_stylelintAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Server

var app = (0, _express2.default)(); // Dependencies


app.use(_bodyParser2.default.json());

app.set('port', process.env.PORT || 5000);

app.get('/', function (_, response) {
  response.send('Hello from Violator bot!');
});

app.post('/', function (_ref, response) {
  var headers = _ref.headers,
      payload = _ref.body;

  var actions = ['opened', 'reopened', 'synchronize'];
  var isProcessablePullRequest = headers['x-github-event'] === 'pull_request' && actions.include(payload.action);
  if (isProcessablePullRequest) {
    console.log('process pull-request:', payload);
    (0, _processPullRequest2.default)(payload);
  } else {
    console.log('non-processable pull-request:', headers, payload);
  }
  response.end();
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});