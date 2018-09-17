module.exports = {
  // So parent files don't get applied
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
  extends: ['plugin:import/recommended', 'airbnb-base'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
  },
  plugins: ['babel', 'import'],
  rules: {
    'linebreak-style': 'off', // Don't play nicely with Windows
    'arrow-body-style': 'off', // Incompatible with prettier
    'arrow-parens': 'off', // Incompatible with prettier
    'object-curly-newline': 'off', // Incompatible with prettier
    'function-paren-newline': 'off', // Incompatible with prettier
    'indent': 'off', // Incompatible with prettier
    'implicit-arrow-linebreak': 'off', // Incompatible with prettier
    'space-before-function-paren': 'off', // Incompatible with prettier
    'no-confusing-arrow': 'off', // Incompatible with prettier
    'no-mixed-operators': 'off', // Incompatible with prettier
    'consistent-this': ['error', 'self'],
    'max-len': [
      'error',
      100,
      2,
      {
        ignoreUrls: true,
      },
    ], // airbnb is allowing some edge cases
    'no-console': 'error', // airbnb is using warn
    'prefer-destructuring': 'off', // airbnb is using error. destructuring harm grep potential.
    'no-alert': 'error', // airbnb is using warn
    'no-param-reassign': 'off', // airbnb use error
    'no-prototype-builtins': 'off', // airbnb use error
    'operator-linebreak': 'off', // airbnb use error

    // It would be better to enable this rule, but it might slow us down.
    'import/no-extraneous-dependencies': 'off',
    'import/namespace': ['error', { allowComputed: true }],
    'import/order': [
      'error',
      {
        groups: [['index', 'sibling', 'parent', 'internal', 'external', 'builtin']],
        'newlines-between': 'never',
      },
    ],

    'no-void': 'off',
  },
};
