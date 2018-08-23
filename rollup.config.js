import babel from 'rollup-plugin-babel';

export default {
  input: 'src/handler.js',
  output: {
    file: 'handler.js',
    format: 'cjs'
  },
  plugins: [
    babel()
  ]
};
