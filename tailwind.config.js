/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Spore Brand Palette
        'spore': {
          'forest': '#25460D',      // Grounding - Forest Green
          'orange': '#b65c17',      // Hero accent - Burnt Orange
          'cream': '#ecd7c0',       // Relief/text on dark
          'white': '#ece7e1',       // Cards/surfaces
          'steel': '#525963',       // Dark base
          'dark': '#1a1a1a',        // Near black for backgrounds
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3rem', { lineHeight: '1.1', fontWeight: '800' }],
        'display-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
      }
    }
  },
  plugins: []
};
