import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "better-auth",
    "@tanstack/react-query",
    "@tanstack/query-core",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d4lgxe9bm8juw.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
