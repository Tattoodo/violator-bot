export default ({ organization, repository, number, pull_request }) => ({
  owner: organization.login,
  repo: repository.name,
  number,
  commit_id: pull_request.head.sha
});
