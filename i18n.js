module.exports = {
  locales: ['en', 'ja', 'zh-cn', 'es-mx'],
  defaultLocale: 'en',
  pages: {
    '*': ['templates', 'components'],
  },
  loadLocaleFrom: async (lang, ns) => require(`./locales/${lang}/${ns}.json`),
}
