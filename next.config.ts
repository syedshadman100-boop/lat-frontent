import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow network access for local dev
  // @ts-ignore - Some Next.js versions have incomplete types for this field
  allowedDevOrigins: ['192.168.0.109', '192.168.0.113'],
};

export default nextConfig;
