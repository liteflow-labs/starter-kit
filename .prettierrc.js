const tailwind = require('prettier-plugin-tailwindcss')
const organizeImports = require('prettier-plugin-organize-imports')

// https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/31
const combinedFormatter = {
  ...tailwind,
  parsers: {
    ...tailwind.parsers,
    ...Object.keys(organizeImports.parsers).reduce((acc, key) => {
      acc[key] = {
        ...tailwind.parsers[key],
        preprocess(code, options) {
          return organizeImports.parsers[key].preprocess(code, options)
        },
      }
      return acc
    }, {}),
  },
}

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
