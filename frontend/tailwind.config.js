/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: "#5C1A27",
        "burgundy-dark": "#4a1520",
        "burgundy-light": "#7a2236",
        gold: "#B8952A",
        "gold-light": "#d4aa40",
        parchment: "#F4EFE4",
        "parchment-dark": "#ebe5d4",
        ivory: "#FAF7F1",
        textp: "#1A1A1A",
        texts: "#6B6B6B",
        navy: "#1D3557",
        forest: "#2D5A1B",
        danger: "#B91C1C",
        success: "#15803D"
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.07)",
        card: "0 4px 16px rgba(92,26,39,0.08)",
        nav: "0 2px 12px rgba(92,26,39,0.15)",
        glow: "0 0 0 3px rgba(184,149,42,0.25)"
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideFade: { from: { opacity: 0, transform: "translateY(6px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideDown: { from: { opacity: 0, transform: "translateY(-8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        pulseFill: { "0%": { transform: "scale(0.95)" }, "50%": { transform: "scale(1.02)" }, "100%": { transform: "scale(1)" } },
        float: { "0%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-5px)" }, "100%": { transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        spin: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } }
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease forwards",
        slideUp: "slideUp 0.3s ease forwards",
        slideFade: "slideFade 0.2s ease forwards",
        slideDown: "slideDown 0.2s ease forwards",
        pulseFill: "pulseFill 0.3s ease",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 1.4s linear infinite",
        spin: "spin 0.8s linear infinite"
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"],
        sans: ["Inter", "system-ui", "Arial", "sans-serif"]
      }
    }
  },
  plugins: []
};
