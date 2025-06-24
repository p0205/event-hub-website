import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.3.109:3000'
  ],
};

export default nextConfig;
