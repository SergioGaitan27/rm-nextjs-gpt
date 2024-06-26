/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/unauthorized',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
