import pluginQuery from '@tanstack/eslint-plugin-query'

// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  ...pluginQuery.configs['flat/recommended'],
  extends: 'expo',
  ignorePatterns: ['/dist/*'],
};
