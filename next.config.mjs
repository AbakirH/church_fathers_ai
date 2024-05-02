/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  },
};

export default nextConfig;