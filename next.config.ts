import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for the partner showcase. Remove `output` once the NestJS API is connected.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
