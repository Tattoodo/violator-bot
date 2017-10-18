import eslint from 'eslint';
import getLineMapFromPatchString from './getLineMapFromPatchString';
import flatMap from './flatMap';

const FILE_FILTER = /\.jsx?$/;

const cli = new eslint.CLIEngine({
  configFile: `${__dirname}/../config/.eslintrc`
});

const filterFiles = files => files.filter(file => FILE_FILTER.test(file.filename));

const eslintMessages = (content, filename) =>
  cli.executeOnText(content, filename).results[0].messages;

const reviewMessage = (filename, lineMap) => ({ ruleId, message, line }) => ({
  path: filename,
  position: lineMap[line],
  body: `**${ruleId}**: ${message}`
});

const lint = fetchContent => file =>
  fetchContent(file).then(content =>
    eslintMessages(content, file.filename)
      .map(reviewMessage(file.filename, getLineMapFromPatchString(file.patch)))
      .filter(review => !!review.position)
  );

export default fetchContent => files =>
  Promise.all(
    filterFiles(files).map(lint(fetchContent))
  ).then(flatMap);
