/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['sutra-loungehtd.vercel.app'],
    minimumCacheTTL: 31536000,
  },
  
  // Compression settings
  compress: true,
  
  // Production source maps
  productionBrowserSourceMaps: false,
  
  // Performance optimizations
  poweredByHeader: false,
  
  // Static generation
  staticPageGenerationTimeout: 60,
  
  // Vercel specific
  swcMinify: true,
};

module.exports = nextConfig;
