module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:vue/recommended'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // recommended by Vetur
    'vue/html-self-closing': 'off',

    // Disable max-len
    'max-len': 'off',

    //Disable attributes limit per line
    'vue/max-attributes-per-line': 'off',

    //Disable attributes order
    'vue/attributes-order': 'off',
    
    // add parens ony when required in arrow function
    'arrow-parens': ['error', 'as-needed'],

    // add new line above comment
    'lines-around-comment': [
      'error',
      {
        beforeBlockComment: true,
        beforeLineComment: true,
        allowBlockStart: true,
        allowClassStart: true,
        allowObjectStart: true,
        allowArrayStart: true,
      },
    ],

    'linebreak-style': 'off',

    // add new line below import
    // 'import/newline-after-import': ['error', { count: 1 }],

    // 'import/extensions': [
    //   'error',
    //   'ignorePackages',
    //   {
    //     js: 'never',
    //     jsx: 'never',
    //     ts: 'never',
    //     tsx: 'never',
    //     vue: 'never',
    //   },
    // ],

    'global-require': 'off',

    // allow function paramaters reassignment
    'no-param-reassign': 0,

    'plugins': ['import'],
  },
}
