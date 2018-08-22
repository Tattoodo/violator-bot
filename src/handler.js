import processPullRequest from './processPullRequest';
import translatePayload from './translatePayload';

const processableActions = ['opened', 'reopened', 'synchronize', 'edited'];

const response = (message, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify({ message })
});

export async function lint(event) {
  const payload = JSON.parse(event.body);
  const githubEvent = event.headers['X-GitHub-Event'];

  if (!githubEvent) {
    return response('No X-Github-Event found on request', 400);
  }

  if (githubEvent === 'ping') {
    return response('pong');
  }

  if (githubEvent !== 'pull_request') {
    return response(`Unsupported X-GitHub-Event; [${githubEvent}]`, 400);
  }

  if (!processableActions.includes(payload.action)) {
    return response(`Unsupported action; [${payload.action}]`, 400);
  }

  try {
    await processPullRequest(translatePayload(payload));
  } catch (error) {
    console.warn('Error while processing pull-request', error.message);
  }

  return response('Processing done');
}
