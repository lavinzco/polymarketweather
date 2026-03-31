import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(222 21% 9%)",
        foreground: "hsl(210 40% 96%)",
        card: "hsl(222 18% 13%)",
        border: "hsl(222 18% 20%)",
        muted: "hsl(218 14% 16%)",
        "muted-foreground": "hsl(214 16% 70%)",
        teal: {
          400: "hsl(174 72% 46%)",
          500: "hsl(174 78% 40%)",
          600: "hsl(174 84% 34%)"
        }
      },
      boxShadow: {
        terminal: "0 0 0 1px hsl(174 78% 40% / 0.25), 0 8px 32px hsl(222 60% 3% / 0.65)",
      },
    },
  },
  plugins: [],
};

export default config;
