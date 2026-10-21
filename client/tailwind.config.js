/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        board: { DEFAULT: "#0F3D33", light: "#1A5446" },
        mask: "#E9EEE8",
        paper: "#F6F8F4",
        ink: "#10201B",
        copper: { DEFAULT: "#A5561F", dark: "#8A4619" },
        solder: "#C8CEC7",
        gold: "#D9B44A",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        body: ['"Instrument Sans"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
