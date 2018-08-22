import stylelint from 'stylelint';
import getLineMapFromPatchString from './getLineMapFromPatchString';
import flatMap from './flatMap';
import stylelintConfig from '../config/stylelintrc';

const FILE_FILTER = /\.css$/;

const filterFiles = files => files.filter(file => FILE_FILTER.test(file.filename));

const stylelintMessages = async (content, filename) => {
  const output = await stylelint.lint({
    code: content,
    codeFilename: filename,
    config: stylelintConfig
  });
  return output.results[0].warnings;
};

const reviewMessage = (filename, lineMap) => ({ line, rule, severity, text }) => ({
  path: filename,
  position: lineMap[line],
  body: `**${rule}**: ${text} [${severity}]`
});

const lint = fetchContent => async file => {
  const content = await fetchContent(file);
  const messages = await stylelintMessages(content, file.filename);
  return messages
    .map(reviewMessage(file.filename, getLineMapFromPatchString(file.patch)))
    .filter(review => !!review.position);
};

export default fetchContent => async files => {
  files = filterFiles(files);
  const reviews = await Promise.all(files.map(lint(fetchContent)));
  return flatMap(reviews);
};
