import stylelint from 'stylelint';
import getLineMapFromPatchString from './getLineMapFromPatchString';
import flatMap from './flatMap';

const FILE_FILTER = /\.css$/;

const CONFIG_FILE = `${__dirname}/../config/.stylelintrc`;

const filterFiles = files => files.filter(file => FILE_FILTER.test(file.filename));

const stylelintMessages = (content, filename) => stylelint.lint({
  code: content,
  codeFilename: filename,
  configFile: CONFIG_FILE
}).then(output => output.results[0].warnings);

const reviewMessage = (filename, lineMap) => ({ line, rule, severity, text }) => ({
  path: filename,
  position: lineMap[line],
  body: `**${rule}**: ${text} [${severity}]`
});

const lint = fetchContent => file =>
  fetchContent(file)
    .then(content => stylelintMessages(content, file.filename))
    .then(messages =>
      messages
        .map(reviewMessage(file.filename, getLineMapFromPatchString(file.patch)))
        .filter(review => !!review.position)
    );

export default fetchContent => files =>
  Promise.all(
    filterFiles(files).map(lint(fetchContent))
  ).then(flatMap);
