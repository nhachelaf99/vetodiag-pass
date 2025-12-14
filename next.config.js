/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "api.qrserver.com",
      "images.unsplash.com",
      "api.dicebear.com"
    ],
  },
};

module.exports = nextConfig;

