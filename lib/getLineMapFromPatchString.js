'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getLineMapFromPatchString;
/**
 * Compute a mapping object for the relationship 'file line number' <-> 'Github's diff view line number'.
 * This is necessary for the comments, as Github API asks to specify the line number in the diff view to attach an inline comment to.
 * If a file line is not modified, then it will not appear in the diff view, so it is not taken into account here.
 * The linter will therefore only mention warnings for modified lines.
 * @param {string} patchString The git patch string.
 * @return {object} An object shaped as follows : {'file line number': 'diff view line number'}.
 */
function getLineMapFromPatchString(patchString) {
  let diffLineIndex = 0;
  let fileLineIndex = 0;
  return patchString.split('\n').reduce((lineMap, line) => {
    if (line.match(/^@@.*/)) {
      fileLineIndex = line.match(/\+[0-9]+/)[0].slice(1) - 1;
    } else {
      diffLineIndex++;
      if ('-' !== line[0]) {
        fileLineIndex++;
        if ('+' === line[0]) {
          lineMap[fileLineIndex] = diffLineIndex;
        }
      }
    }
    return lineMap;
  }, {});
}