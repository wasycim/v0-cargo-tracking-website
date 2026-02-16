/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["recharts", "react-smooth", "d3-scale", "d3-shape", "d3-time-format", "d3-time", "d3-array", "d3-format", "d3-interpolate", "d3-color", "d3-path"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
