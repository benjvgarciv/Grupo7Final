/** @type {import('next').NextConfig} */
const nextConfig = {
  // TODO: Configurar dominio de imágenes cuando se migre a S3/CDN
  // images: {
  //   remotePatterns: [{ protocol: 'https', hostname: 'tu-bucket.s3.amazonaws.com' }],
  // },
  async rewrites() {
    // Obtener la URL base (por defecto localhost si no existe)
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // Limpiar espacios en blanco por si acaso
    apiUrl = apiUrl.trim();

    // Si la URL no empieza con http:// ni con https://, le añadimos https:// por defecto
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      apiUrl = `https://${apiUrl}`;
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
