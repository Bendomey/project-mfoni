import {type Config} from 'tailwindcss'

export default {
  content: ['./app/**/*.+(js|jsx|ts|tsx|mdx|md)'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
} satisfies Config
