'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _github = require('github');

var _github2 = _interopRequireDefault(_github);

var _eslintAdapter = require('./eslintAdapter');

var _eslintAdapter2 = _interopRequireDefault(_eslintAdapter);

var _stylelintAdapter = require('./stylelintAdapter');

var _stylelintAdapter2 = _interopRequireDefault(_stylelintAdapter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const config = {
  username: process.env.GITHUB_USERNAME,
  password: process.env.GITHUB_PASSWORD
};

Object.keys(config).forEach(key => {
  if (!config[key]) {
    console.error(`Missing ${key} config! Exiting...`);
    process.exit(1);
  }
});

// Github configuration

const github = new _github2.default();

github.authenticate(Object.assign({ type: 'basic' }, config));

// Functions

const getFiles = async (owner, repo, number) => {
  const response = await github.pullRequests.getFiles({
    owner,
    repo,
    number
  });
  return response.data;
};

const makeContentFetcher = (owner, repo, commit_id) => async file => {
  const response = await github.repos.getContent({
    owner,
    repo,
    path: file.filename,
    ref: commit_id
  });
  return Buffer.from(response.data.content, 'base64').toString();
};

const createStatusSetter = (owner, repo, sha) => async (state, description) => {
  await github.repos.createStatus({
    owner,
    repo,
    sha,
    state,
    description,
    context: 'violator-bot'
  });
};

const processPullRequest = async ({ owner, repo, number, commit_id }) => {
  try {
    const setStatus = createStatusSetter(owner, repo, commit_id);
    setStatus('pending', 'Linting…');
    const fetchContent = makeContentFetcher(owner, repo, commit_id);
    const files = await getFiles(owner, repo, number);
    const [eslintReviews, stylelintReviews] = await Promise.all([(0, _eslintAdapter2.default)(fetchContent)(files), (0, _stylelintAdapter2.default)(fetchContent)(files)]);
    const eslintViolations = eslintReviews.length > 0;
    const stylelintViolations = stylelintReviews.length > 0;
    const hasViolations = eslintViolations || stylelintViolations;
    if (hasViolations) {
      const review = {
        owner,
        repo,
        number,
        commit_id,
        event: 'COMMENT',
        comments: eslintReviews.concat(stylelintReviews)
      };
      console.log('--- posting review:', review);
      await github.pullRequests.createReview(review);
      setStatus('failure', `${[eslintViolations && `ESLint`, stylelintViolations && `stylelint`].filter(s => s).join(` and `)} violations found`);
    } else {
      setStatus('success', 'No linting violations found');
    }
  } catch (error) {
    console.error('=== something bad happened!!!', error);
  }
};

exports.default = processPullRequest;