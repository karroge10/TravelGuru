import next from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...next,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      // React 19 / hooks plugin v7: common patterns (hydration, MQL, carousel init) are still valid here
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default config;
