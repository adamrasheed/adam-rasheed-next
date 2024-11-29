import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        bgSecondaryHover: "var(--bgSecondaryHover)",
        instagram: "var(--instagram)",
        facebook: "var(--facebook)",
        youtube: "var(--youtube)",
        dribbble: "var(--dribbble)",
        linkedin: "var(--linkedin)",
        twitter: "var(--twitter)",
        shopify: "var(--shopify)",
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "0px",
        lg: "0px",
      },
      screens: {
        xl: "960px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
