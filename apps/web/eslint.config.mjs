import baseConfig from "@expo-playground/config/eslint.base";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [".next/"],
  },
];
