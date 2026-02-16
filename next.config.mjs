/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["recharts", "react-smooth"],
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react"],
  },
}

export default nextConfig
