/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: Configurar dominio de imágenes cuando se migre a S3/CDN
  // images: {
  //   remotePatterns: [{ protocol: 'https', hostname: 'tu-bucket.s3.amazonaws.com' }],
  // },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
