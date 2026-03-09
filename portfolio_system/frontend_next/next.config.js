/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.planorah.me" },
      { protocol: "https", hostname: "**.amazonaws.com" }
    ]
  }
};

module.exports = nextConfig;
