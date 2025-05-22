import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  serverExternalPackages: ['playwright'],
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Uncomment these for GitHub Pages deployment
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/browser-automation-agent' : '',
  // basePath: process.env.NODE_ENV === 'production' ? '/browser-automation-agent' : ''
};

export default nextConfig;
