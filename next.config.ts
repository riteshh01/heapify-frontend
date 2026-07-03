import type { NextConfig } from "next";

// The backend URL — reads from env in production, falls back to localhost for dev
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

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

  /**
   * API Proxy Rewrites
   *
   * Problem: Chrome blocks cross-site cookies (sec-fetch-site: cross-site)
   * even when cookies have SameSite=None; Secure. The frontend is on
   * heapify-frontend.vercel.app and the backend on heapify-backend.vercel.app —
   * different domains = third-party = cookies stripped by Chrome.
   *
   * Solution: Proxy all /api/* requests through the Next.js server itself.
   * The browser sends requests to the SAME origin (heapify-frontend.vercel.app/api/*)
   * which Next.js forwards server-side to the real backend. Cookies are
   * now first-party and always included.
   *
   * After deploying, update Vercel env vars in the FRONTEND project:
   *   NEXT_PUBLIC_API_URL      = /api/auth       (relative — no domain)
   *   NEXT_PUBLIC_API_BASE_URL = /api             (relative — no domain)
   *   NEXT_PUBLIC_BACKEND_URL  = https://heapify-backend.vercel.app  (used here only)
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
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
