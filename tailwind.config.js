/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // If using pages directory
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // If using app directory
  ],
  theme: {
    extend: {
      // Add custom theme extensions here
      // Example: custom colors, fonts, spacing
      // colors: {
      //   brand: {
      //     light: '#3b82f6',
      //     DEFAULT: '#2563eb',
      //     dark: '#1d4ed8',
      //   },
      // },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    // Add any Tailwind plugins here
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
  ],
}; 