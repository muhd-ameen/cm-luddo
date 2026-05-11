/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bricolage Grotesque", "sans-serif"],
        body: ["Manrope", "sans-serif"]
      },
      colors: {
        stage: {
          950: "#050a14",
          900: "#0a1528"
        },
        campaign: {
          red: "#ef4a57",
          blue: "#3c8dff",
          gold: "#f7c45f"
        }
      },
      boxShadow: {
        glowRed: "0 24px 48px rgba(239,74,87,0.32)",
        glowBlue: "0 24px 48px rgba(60,141,255,0.32)",
        glass: "0 20px 60px rgba(5, 14, 30, 0.45)"
      }
    }
  },
  plugins: []
};
