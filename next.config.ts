/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pizzahut.vn',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
