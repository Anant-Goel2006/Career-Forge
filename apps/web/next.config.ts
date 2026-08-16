import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.NEXT_PUBLIC_API_BASE_URL 
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/:path*` 
          : "http://127.0.0.1:8000/v1/:path*", // Proxy to FastAPI
      },
    ];
  },
};

export default nextConfig;
