import stylelint from 'stylelint';
import getLineMapFromPatchString from './getLineMapFromPatchString';
import flatMap from './flatMap';

const FILE_FILTER = /\.css$/;

const filterFiles = files =>
  files.filter(({ filename }) => filename.match(FILE_FILTER));

const stylelintMessages = (content, filename) =>
  stylelint.lint({
    code: content,
    codeFilename: filename
  }).then(({ results: { warnings } }) => warnings);

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
        .filet(review => review.position)
    );

export default fetchContent => files =>
  Promise.all(
    filterFiles(files).map(lint(fetchContent))
  ).then(flatMap);
