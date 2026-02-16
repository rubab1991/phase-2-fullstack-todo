/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack explicitly
  experimental: {
    turbo: {
      enabled: false
    }
  }
};

module.exports = nextConfig;