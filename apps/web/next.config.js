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
  // Ignore ESLint warnings during build for faster production deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript warnings during build
  typescript: {
    ignoreBuildErrors: false, // Keep type checking enabled for safety
  },
  // Include Prisma binaries in serverless bundle
  outputFileTracingIncludes: {
    '/api/**/*': [
      '../../node_modules/.pnpm/@prisma+client@*/node_modules/.prisma/client/**/*',
      '../../packages/database/node_modules/.prisma/client/**/*',
    ],
  },
};

module.exports = nextConfig;
