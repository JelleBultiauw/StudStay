/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3D5AFE',
        accent: '#FFC107',
        background: '#F5F7FA',
        surface: '#FFFFFF',
        'text-primary': '#212121',
        'text-secondary': '#666666',
        success: '#4CAF50',
        error: '#F44336',
      },
    },
  },
  plugins: [],
};
