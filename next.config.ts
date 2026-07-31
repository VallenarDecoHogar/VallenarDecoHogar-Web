import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdnx.jumpseller.com",
      },
      {
        protocol: "https",
        hostname: "images.jumpseller.com",
      },
    ],
  },
};

export default nextConfig;
