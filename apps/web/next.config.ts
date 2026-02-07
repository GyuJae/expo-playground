import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@expo-playground/domain",
    "@expo-playground/application",
    "@expo-playground/infrastructure",
  ],
};

export default nextConfig;
