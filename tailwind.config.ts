import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.10)",
        ring: "#1D9E75",
        background: "#12121a",
        foreground: "#f0f0ec",
        teal: {
          DEFAULT: "#1D9E75",
          foreground: "#ffffff",
        },
        primary: {
          DEFAULT: "#1D9E75",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1a1a26",
          foreground: "#f0f0ec",
        },
        muted: {
          DEFAULT: "#1a1a26",
          foreground: "#9db8b0",
        },
        accent: {
          DEFAULT: "#1a1a26",
          foreground: "#f0f0ec",
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(0 0% 100%)",
        },
      },
      fontFamily: {
        lora: ["'Lora'", "serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
