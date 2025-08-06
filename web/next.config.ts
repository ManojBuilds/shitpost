import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com'
      }, 
      {
        hostname: 'abs.twimg.com',
        protocol: 'https',
      },
      {
        hostname: "hidden-cow-597.convex.cloud" ,
        protocol: 'https'
      }
    ]
  }
};

export default nextConfig;
