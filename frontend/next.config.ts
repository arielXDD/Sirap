import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  
  // Optimización de imágenes
  images: {
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
  },

  // Comprimir respuestas del servidor Next.js
  compress: true,

  // Caché de compilación para acelerar reinicios en desarrollo
  experimental: {
    optimizePackageImports: ['sonner'],
  },

  // Logging mínimo en fetches
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
