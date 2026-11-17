/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindFunctions: ["clsx", "cn"],
  semi: true,
  singleQuote: false,
  trailingComma: "all",
};

export default config;
