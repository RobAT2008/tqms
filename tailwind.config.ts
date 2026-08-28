import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0B3D91",
          50: "#EAF0FB",
          100: "#CFDDF5",
          200: "#9FBBEB",
          300: "#6F99E0",
          400: "#3F77D6",
          500: "#1A56C4",
          600: "#123F92",
          700: "#0B3D91",
          800: "#082A64",
          900: "#051837",
        },
        accent: { DEFAULT: "#1FA37A" },
      },
      borderRadius: { xl: "0.9rem", "2xl": "1.25rem" },
      boxShadow: { soft: "0 4px 20px rgba(11,61,145,0.08)" },
    },
  },
  plugins: [],
};
export default config;
