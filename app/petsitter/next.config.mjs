/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint is run separately; never let it block a production build.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        // Allow the service worker to control the whole origin and never cache it.
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
