import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Note: devIndicators is deprecated in Next.js 15.
  // We rely on layout-level soft-hide to remove the Route/Turbopack dev UI.
};

export default nextConfig;
