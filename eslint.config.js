const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'supabase/functions/*'],
  },
  {
    rules: {
      // Guards against raw quotes breaking HTML parsing. React Native <Text>
      // renders them literally, so the rule only creates noise here.
      'react/no-unescaped-entities': 'off',
    },
  },
];
