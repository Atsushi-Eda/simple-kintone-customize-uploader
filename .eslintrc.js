module.exports = {
  extends: ['@toyokumo/eslint-config', '@toyokumo/eslint-config/rules/typescript.js'],
  settings: {
    'import/resolver': {
      node: {
        paths: ['src'],
        extensions: ['.ts'],
      },
    },
  },
};
