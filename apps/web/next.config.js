/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@grantbr/ui", "@grantbr/database"],
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
