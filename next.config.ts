import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de productos subidas desde el panel viven en el bucket publico
    // de Supabase Storage (https://<ref>.supabase.co/storage/v1/object/public/...).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
