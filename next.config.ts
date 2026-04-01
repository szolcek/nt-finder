import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.216"],
  images: {
    remotePatterns: [
      { hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
