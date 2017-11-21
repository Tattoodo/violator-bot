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

var _flatMap = require('./flatMap');

var _flatMap2 = _interopRequireDefault(_flatMap);

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

const hasChanges = file => file.status !== 'removed' && file.changes > 0;

const getFiles = async (owner, repo, number) => {
  const response = await github.pullRequests.getFiles({
    owner,
    repo,
    number
  });
  return response.data.filter(hasChanges);
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

const postReview = async (owner, repo, number, commit_id, comments) => {
  const review = {
    owner,
    repo,
    number,
    commit_id,
    event: 'COMMENT',
    comments
  };
  console.log('--- posting review:', review);
  return github.pullRequests.createReview(review);
};

const collectViolations = async (owner, repo, number, commit_id) => {
  const fetchContent = makeContentFetcher(owner, repo, commit_id);
  const files = await getFiles(owner, repo, number);
  const [eslintReviews, stylelintReviews] = await Promise.all([(0, _eslintAdapter2.default)(fetchContent)(files), (0, _stylelintAdapter2.default)(fetchContent)(files)]);

  return [['ESLint', eslintReviews], ['stylelint', stylelintReviews]].reduce((acc, [title, reviews]) => {
    if (reviews.length > 0) {
      acc[title] = reviews;
    }
    return acc;
  }, {});
};

const processPullRequest = async ({ owner, repo, number, commit_id }) => {
  const setStatus = createStatusSetter(owner, repo, commit_id);
  try {
    setStatus('pending', 'Linting…');

    let status = 'success';
    let message = 'No linting violations found';

    const violations = await collectViolations(owner, repo, number, commit_id);
    const keys = Object.keys(violations);
    if (keys.length > 0) {
      status = 'failure';
      message = `${keys.join(` and `)} violations found`;
      await postReview(owner, repo, number, commit_id, (0, _flatMap2.default)(keys.map(key => violations[key])));
    }

    setStatus(status, message);
  } catch (error) {
    console.error('=== something bad happened!!!', error);
    setStatus('error', `Linting failed; ${error.message}`);
  }
};

exports.default = processPullRequest;