import GitHubApi from 'github';
import flatMap from './flatMap';

const config = {
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_PASSWORD
};

Object.keys(config).forEach(key => {
  if (!config[key]) {
    console.error(`Missing ${key} config! Exiting...`);
    process.exit(1);
  }
})

// Github configuration

const github = new GitHubApi();

github.authenticate(Object.assign({ type: 'basic' }, config));

// Functions

const translatePayload = ({ organization, repository, number, pull_request }) => ({
  owner: organization.login,
  repo: repository.name,
  number,
  commit_id: pull_request.head.sha
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
      eslintAdapter(fetchContent)(files),
      stylelintAdapter(fetchContent)(files)
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

export default payload =>
  processPullRequest(translatePayload(payload));