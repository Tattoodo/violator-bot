export default {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "mocha": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended"
  ],
  "globals": {
    "gapi": true,
    "googletag": true
  },
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "babel",
    "jsx-a11y",
    "react"
  ],
  "rules": {
    "indent": [ "error", 4, { "SwitchCase": 1 } ],
    "jsx-quotes": [ "error", "prefer-double" ],
    "no-trailing-spaces": [ "error" ],
    "quotes": [ "error", "single", { "allowTemplateLiterals": true } ],
    "semi": [ "error", "always" ],
    "babel/semi": [ "error", "always" ],
    "jsx-a11y/label-has-for": [ "error", { "required": { "some": [ "nesting", "id" ] } } ],
    "react/jsx-curly-spacing": [ "error", "never" ],
    "react/jsx-first-prop-new-line": [ "error" ],
    "react/jsx-max-props-per-line": [ "error", { "maximum": 2 } ],
    "react/default-props-match-prop-types": 1,
    "react/display-name": 1,
    "react/no-did-mount-set-state": 1,
    "react/no-deprecated": 1,
    "react/no-array-index-key": 1,
    "react/prop-types": 1,
    "react/react-in-jsx-scope": 1
  },
  "settings": {
    "react": {
      "version": "15.4"
    }
  }
};
