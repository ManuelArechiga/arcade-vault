import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/detalle/:id*",
        destination: "/juegos/:id*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
