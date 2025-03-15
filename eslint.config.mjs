import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import { dirname } from "path";

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Extends
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom rules
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/jsx-no-duplicate-props": "off",
    },
  },
];
