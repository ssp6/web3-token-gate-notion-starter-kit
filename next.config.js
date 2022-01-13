// const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})
const withTM = require('next-transpile-modules')(['eth-hooks'])

module.exports = withTM(
  withBundleAnalyzer({
    images: {
      domains: ['pbs.twimg.com']
    }
  })
)
