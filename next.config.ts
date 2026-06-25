import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async redirects() {
    return [
      { source: "/insights", destination: "/resources", permanent: true },
      { source: "/insights/:slug", destination: "/resources/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
