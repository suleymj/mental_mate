/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    CANISTER_ID_MENTALMATE_BACKEND: process.env.CANISTER_ID_MENTALMATE_BACKEND,
  },
}

export default nextConfig


