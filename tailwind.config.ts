import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        panel: "#101010",
        panelBorder: "#242424",
        field: "#161616",
        muted: "#b5b5b5"
      }
    }
  },
  plugins: []
};

export default config;
