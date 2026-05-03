/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagsapi.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
