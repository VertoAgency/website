/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.html'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Geist', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Geist', 'Inter', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono:    ['"Geist Mono"', 'ui-monospace', 'monospace'],
        script:  ['Caveat', 'cursive'],
      },
      colors: {
        'brand-light':    '#66CCFF',
        'brand-blue':     '#0099FF',
        'dark-blue':      '#0066CC',
        'brand-dark':     '#060026',
        'navy':           '#060026',
        'accent-purple':  '#8B57F4',
        'accent-cyan':    '#43E5FF',
        'accent-lime':    '#E1F77E',
        'cool-gray':      '#B4D9C0',
        'light-blue':     '#d9f0ff',
        primary:          '#060026',
        secondary:        '#0099FF',
        accent:           '#43E5FF',
      },
    },
  },
  plugins: [],
}
