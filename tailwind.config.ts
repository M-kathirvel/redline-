import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: "#050505",
        crimson: "#DC2626",
        muted: "#A3A3A3"
      }
    }
  },
  plugins: []
};

export default config;
