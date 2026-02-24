/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.prom.ua" },
    ],
  },
};

module.exports = nextConfig;

