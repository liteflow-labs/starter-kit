module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  printWidth: 80,
  overrides: [
    {
      files: '**/*.sol',
      options: {
        singleQuote: false,
      },
    },
  ],
}
