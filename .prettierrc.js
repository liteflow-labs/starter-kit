module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  printWidth: 80,
  plugins: [combinedFormatter],
  overrides: [
    {
      files: '**/*.sol',
      options: {
        singleQuote: false,
      },
    },
  ],
}
