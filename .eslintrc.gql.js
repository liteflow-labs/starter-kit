module.exports = {
  root: true,
  parser: '@graphql-eslint/eslint-plugin',
  plugins: ['@graphql-eslint/eslint-plugin'],
  extends: ['plugin:@graphql-eslint/operations-recommended'],
  rules: {
    '@graphql-eslint/require-id-when-available': 'off',
    '@graphql-eslint/selection-set-depth': 'off',
    '@graphql-eslint/naming-convention': 'warn',
    '@graphql-eslint/no-deprecated': 'warn',
  },
}
