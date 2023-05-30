const nextTranslate = require('next-translate')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

module.exports = nextTranslate(withBundleAnalyzer(nextConfig))
