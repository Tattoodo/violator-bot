import GitHubApi from 'github';
import flatMap from './flatMap';
import eslintAdapter from './eslintAdapter';
import stylelintAdapter from './stylelintAdapter';

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

const github = new GitHubApi();

github.authenticate(Object.assign({ type: 'basic' }, config));

// Functions

const translatePayload = ({ organization, repository, number, pull_request }) => ({
  owner: organization.login,
  repo: repository.name,
  number,
  commit_id: pull_request.head.sha
});

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
  })
  return Buffer.from(response.data.content, 'base64').toString();
};

const processPullRequest = async ({ owner, repo, number, commit_id }) => {
  try {
    const fetchContent = makeContentFetcher(owner, repo, commit_id);
    const files = await getFiles(owner, repo, number);
    const [eslintReviews, stylelintReviews] = await Promise.all([
      eslintAdapter(fetchContent)(files),
      stylelintAdapter(fetchContent)(files)
    ]);
    const eslintViolations = eslintReviews.length > 0;
    const stylelintViolations = stylelintReviews.length > 0;
    const hasViolations = eslintViolations || stylelintViolations;
    const review = {
      owner,
      repo,
      number,
      commit_id,
      event: hasViolations ? 'REQUEST_CHANGES' : 'APPROVE',
      comments: eslintReviews.concat(stylelintReviews)
    };
    if (hasViolations) {
      review.body = `${[eslintViolations && `ESLint`, stylelintViolations && `stylelint`].filter(s => s).join(` and `)} violations found.`;
    }
    console.log('--- posting review:', review);
    await github.pullRequests.createReview(review);
  } catch (error) {
    console.error('=== something bad happened!!!', error);
  }
};

export default payload => processPullRequest(translatePayload(payload));
