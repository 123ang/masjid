import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from same origin API paths
    // Next.js will use the current request's hostname for same-origin images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.i-masjid.my',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/uploads/**',
      },
    ],
    // Use default loader which handles same-origin correctly
    loader: 'default',
    unoptimized: false,
  },
};

export default nextConfig;
