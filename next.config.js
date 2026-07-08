/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    }
    config.stats = 'errors-only'
    return config
  },
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
}

module.exports = nextConfig
