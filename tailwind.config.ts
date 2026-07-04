import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#171340",
          800: "#211C4D",
          700: "#2D2A6E",
          600: "#3D3894",
        },
        signal: {
          amber: "#F5A623",
          coral: "#FF6B57",
        },
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-30px) scale(1.05)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(245, 166, 35, 0.25)" },
          "50%": { boxShadow: "0 0 40px rgba(245, 166, 35, 0.55), 0 0 60px rgba(45, 42, 110, 0.3)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
