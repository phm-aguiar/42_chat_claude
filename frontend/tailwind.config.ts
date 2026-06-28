import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "0",
        none: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        full: "0",
      },
      colors: {
        "42-black": "#1B1B1B",
        "42-white": "#FFFFFF",
        "42-navy": "#173D7A",
        "42-near-black": "#202026",
        "42-dark-gray": "#29292E",
        "42-mid-gray": "#5B5B60",
        "42-light-gray": "#E3E3E3",
        "42-teal": "#00BABC",
        "42-cg-blue": "#04809F",
        "42-green": "#2DD57A",
        "42-pink": "#EC3391",
        "42-purple": "#7300FF",
      },
      fontFamily: {
        sans: ["Futura PT", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
