import eslint from 'eslint';
import getLineMapFromPatchString from './getLineMapFromPatchString';
import flatMap from './flatMap';
import eslintConfig from '../config/eslintrc';

const FILE_FILTER = /\.jsx?$/;

const cli = new eslint.CLIEngine({
  baseConfig: eslintConfig,
  useEslintrc: false
});

const filterFiles = files => files.filter(file => FILE_FILTER.test(file.filename));

const eslintMessages = (content, filename) =>
  cli.executeOnText(content, filename).results[0].messages;

const reviewMessage = (filename, lineMap) => ({ ruleId, message, line }) => ({
  path: filename,
  position: lineMap[line],
  body: `**${ruleId}**: ${message}`
});

const lint = fetchContent => async file => {
  const content = await fetchContent(file);
  return eslintMessages(content, file.filename)
    .map(reviewMessage(file.filename, getLineMapFromPatchString(file.patch)))
    .filter(review => !!review.position);
};

export default fetchContent => async files => {
  files = filterFiles(files);
  const reviews = await Promise.all(files.map(lint(fetchContent)));
  return flatMap(reviews)
};
