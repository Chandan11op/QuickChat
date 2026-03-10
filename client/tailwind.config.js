/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // Bright blue
        primaryHover: "#1D4ED8",
        dark: {
          900: "#0B1120", // Deepest background
          800: "#0F172A", // Main background
          700: "#1E293B", // Card/Sidebar background
          600: "#334155", // Border/Hover
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}