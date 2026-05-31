/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/feed",
        permanent: true, // Set to true for a 308 permanent redirect
      },
    ];
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nyc3.digitaloceanspaces.com",
        port: "",
        pathname: "/bloomin-s3/**",
      },
    ],
  },
};


const pwaConfig = {
  dest: "public",
  disable: process.env.NODE_ENV == "development",
  cacheOnFrontEndNav: false,
  reloadOnOnline: true,
};

export default withPWA(pwaConfig)(nextConfig);