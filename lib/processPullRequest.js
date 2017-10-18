'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _github = require('github');

var _github2 = _interopRequireDefault(_github);

var _flatMap = require('./flatMap');

var _flatMap2 = _interopRequireDefault(_flatMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var files = function files(owner, repo, number) {
  return github.pullRequests.getFiles({
    owner: owner,
    repo: repo,
    number: number
  }).then(function (response) {
    return response.data;
  });
};

var makeContentFetcher = function makeContentFetcher(owner, repo, commit_id) {
  return function (file) {
    return github.repos.getContent({
      owner: owner,
      repo: repo,
      path: file.filename,
      ref: file.sha || commit_id
    }).then(function (response) {
      return Buffer.from(response.data.content, 'base64').toString();
    });
  };
};

var processPullRequest = function processPullRequest(_ref2) {
  var owner = _ref2.owner,
      repo = _ref2.repo,
      number = _ref2.number,
      commit_id = _ref2.commit_id;
  return files(owner, repo, number).then(function (files) {
    return [files, makeContentFetcher(owner, repo, commit_id)];
  }).then(function (files, fetchContent) {
    return (0, _flatMap2.default)([function (files) {
      return console.log('processing files:', files) || [];
    }(files), eslintAdapter(fetchContent)(files), stylelintAdapter(fetchContent)(files)]);
  }).then(function (review) {
    github.pullRequests.createReview({
      owner: owner,
      repo: repo,
      number: number,
      commit_id: commit_id,
      comments: reviews.filter(function (review) {
        return review;
      })
    });
  });
};

exports.default = function (payload) {
  return processPullRequest(translatePayload(payload));
};