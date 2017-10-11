// Dependencies
import express from 'express';
import bodyParser from 'body-parser';
import GitHubApi from 'github';
import flatMap from './flatMap';
import eslintAdapter from './eslintAdapter';

// Github configuration

const github = new GitHubApi();

github.authenticate({
  type: 'basic',
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_PASSWORD
});

// Functions

const translatePayload = ({ organization, repository, number, after }) => ({
  owner: organization.login,
  repo: repository.name,
  number,
  commit_id: after
});

const files = (owner, repo, number) =>
  github.pullRequests.getFiles({
    owner,
    repo,
    number
  }).then(response => response.data)

const makeContentFetcher = (owner, repo, commit_id) => file =>
  github.repos.getContent({
    owner,
    repo,
    path: file.filename,
    ref: file.sha || commit_id
  }).then(response => Buffer.from(response.data.content, 'base64').toString());

const processPullRequest = ({ owner, repo, number, commit_id }) =>
  files(owner, repo, number)
    .then(files => [files, makeContentFetcher(owner, repo, commit_id)])
    .then((files, fetchContent) => flatMap([
      eslintAdapter(fetchContent)(files)
    ]))
    .then(review => {
      github.pullRequests.createReview({
        owner,
        repo,
        number,
        commit_id,
        comments: reviews.filter(review => review)
      });
    });

// Server

const app = express();

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

app.get('/', (_, response) => {
  response.send('Hello from Violator bot!');
});

app.post('/', ({ headers, body: payload }, response) => {
  const actions = ['create', 'synchronize'];
  if (headers['X-GitHub-Event'] === 'pull_request' && payload && actions.include(payload.action)) {
    processPullRequest(translatePayload(payload));
  }
  response.end();
});

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
