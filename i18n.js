module.exports = {
  locales: ['en'],
  defaultLocale: 'en',
  pages: {
    '*': ['templates', 'components'],
  },
  loadLocaleFrom: async (lang, ns) => {
    return require(`@nft/${ns}/locales/${lang}/${ns}.json`)
  },
}
