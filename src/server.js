// Dependencies
import express from 'express';
import bodyParser from 'body-parser';
import processPullRequest from './processPullRequest';
import eslintAdapter from './eslintAdapter';
import stylelintAdapter from './stylelintAdapter';

// Server

const app = express();

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

app.get('/', (_, response) => {
  response.send('Hello from Violator bot!');
});

app.post('/', ({ headers, body: payload }, response) => {
  const actions = ['create', 'synchronize'];
  const isProcessablePullRequest = headers['X-GitHub-Event'] === 'pull_request' && actions.include(payload.action);
  if (isProcessablePullRequest) {
    processPullRequest(payload);
  }
  response.end();
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
