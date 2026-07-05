/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Pindahkan ke tingkat utama (top-level) sesuai aturan Next.js terbaru
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Kosongkan atau isi dengan fitur eksperimental lain jika ada
  }
};

export default nextConfig;
