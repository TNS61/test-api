/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DB_HOST: "localhost",
    DB_USER: "root",
    DB_PASSWORD: "",
    DB_NAME: "test_nextjs",
    JWT_SECRET: "VE3Ko6Fk6HKHVevj"
  },
};

export default nextConfig;
