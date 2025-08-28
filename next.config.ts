/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'plugxngymqlkkcvznnbc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // You can add custom config here like allowedDevOrigins if you're using it elsewhere
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://192.168.3.109:3000',
    'http://10.251.215.109:3000',
    
  ],
};

module.exports = nextConfig;
