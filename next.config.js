const nextTranslate = require('next-translate-plugin')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
const removeImports = require('next-remove-imports')()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'standalone',
  images: {
    minimumCacheTTL: 3600 * 24 * 365, // 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, options) => {
    if (!options.isServer) {
      if (!config.resolve) config.resolve = {}
      if (!config.resolve.fallback) config.resolve.fallback = {}
      config.resolve.fallback.fs = false
    }
    return config
  },
  reactStrictMode: true,
}

module.exports = nextTranslate(withBundleAnalyzer(removeImports(nextConfig)))
