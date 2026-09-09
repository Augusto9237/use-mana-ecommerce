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
        hostname: "pub-0226401e7cb24ef5bbaf13b4fdf33d5a.r2.dev",
      },
      {
        protocol: "https",
        hostname: "d4lgxe9bm8juw.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
