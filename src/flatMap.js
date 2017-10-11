export default arrayOfArrays =>
  arrayOfArrays.reduce((acc, array) => acc.concat(array), []);
