import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Ensure the public directory is served properly
  experimental: {
    serverComponentsExternalPackages: ['uuid'],
  },
  webpack: (config) => {
    // This is to fix cloudinary using fs which is not available in the browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
