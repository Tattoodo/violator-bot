'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _processPullRequest = require('./processPullRequest');

var _processPullRequest2 = _interopRequireDefault(_processPullRequest);

var _translatePayload = require('./translatePayload');

var _translatePayload2 = _interopRequireDefault(_translatePayload);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Server

// Dependencies
const app = (0, _express2.default)();

app.use(_bodyParser2.default.json());

app.set('port', process.env.PORT || 5000);

app.get('/', (_, response) => {
  response.send('Hello from Violator bot!');
});

app.post('/', ({ headers, body: payload }, response) => {
  const actions = ['opened', 'reopened', 'synchronize', 'edited'];
  const isProcessablePullRequest = headers['x-github-event'] === 'pull_request' && actions.includes(payload.action);
  if (isProcessablePullRequest) {
    payload = (0, _translatePayload2.default)(payload);
    console.log('--- process pull-request:', payload);
    (0, _processPullRequest2.default)(payload);
  } else {
    console.log('--- non-processable pull-request:', headers, payload);
  }
  response.end();
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});