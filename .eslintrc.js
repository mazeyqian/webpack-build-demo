module.exports = {
  root: true, // 指定跟路径
  parserOptions: {
    sourceType: 'module', // ECMAScript 模块
    ecmaVersion: 9, // JavaScript 版本，https://eslint.org/docs/latest/use/configure/language-options
    parser: 'babel-eslint', // 解析器
  },
  env: {
    browser: true, // 浏览器启用
    node: true, // node 启用
    es6: true, // es6 启用
  },
  extends: [
    'standard', // js标准规则
    // https://standardjs.com/rules-zhcn.html#javascript-standard-style
  ],
  // add your custom rules here
  rules: {
    indent: ['error', 2], // 缩进宽度 2 个空格
    'comma-dangle': ['warn', 'always-multiline'],
    'no-constant-condition': 'off', // 允许常量作为表达式条件
    'no-delete-var': 'off', // 允许使用 delete
    'no-extend-native': 'off', // 允许扩展原生对象
    'no-floating-decimal': 'off', //  允许省去小数点前的0
    'no-multi-str': 'off', // 允许多行字符串
    // allow async-await
    'generator-star-spacing': 'off', // 关闭
    semi: ['error', 'always'], // 使用分号
    quotes: ['error', 'single'], // 使用单引号
    // 'no-unused-vars': ['warn', 'always'], // 未使用变量
    // 最大长度 120
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreUrls: true,
      },
    ],
    // 最大行数 500
    'max-lines': [
      'warn',
      {
        max: 500,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    // 要求使用 let 或 const 而不是 var
    'no-var': ['error'],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
};
