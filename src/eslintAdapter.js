import eslint from 'eslint';
import getLineMapFromPatchString from './getLineMapFromPatchString';
import flatMap from './flatMap';

const FILE_FILTER = /.*(.js|.jsx)$/;

const cli = new eslint.CLIEngine();

const filterFiles = files =>
  files.filter(({ filename }) => filename.match(FILE_FILTER));

const eslintMessages = (content, filename) =>
  cli.executeOnText(content, filename).results[0].messages;

const reviewMessage = (filename, lineMap) => ({ ruleId, message, line }) => ({
  path: filename,
  position: lineMap[line],
  body: `**${ruleId}**: ${message}`
});

const lint = fetchContent => file =>
  fetchContent(file).then(content =>
    eslintMessages(contents, file.filename)
      .map(reviewMessage(file.filename, getLineMapFromPatchString(file.patch)))
      .filet(review => review.position)
  );

export default fetchContent => files =>
  Promise.all(
    filterFiles(files).map(lint(fetchContent))
  ).then(flatMap);
