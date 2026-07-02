import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable the `X-Powered-By: Next.js` response header for security
  poweredByHeader: false,

  // Enforce React strict mode for catching potential issues early
  reactStrictMode: true,

  // Allow trailing slashes for consistent URL handling on Vercel
  trailingSlash: false,

  // Image optimization — add any external image hostnames your app uses
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Security & CORS headers applied to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

