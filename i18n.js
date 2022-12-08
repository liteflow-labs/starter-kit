module.exports = {
  locales: ['en', 'ja', 'zh-cn', 'es-mx'],
  defaultLocale: 'en',
  pages: {
    '*': ['templates', 'components'],
  },
  loadLocaleFrom: async (lang, ns) => {
    if (ns === 'templates') return require(`./locales/${lang}/templates.json`)
    const general = require(`@nft/${ns}/locales/${lang}/${ns}.json`)
    try {
      const overrides = require(`./locales/${lang}/${ns}.json`)
      // TODO: Add deep merge instead of merge so we can override absolutely everything
      return {
        ...general,
        ...overrides,
      }
    } catch (e) {
      return general
    }
  },
}
