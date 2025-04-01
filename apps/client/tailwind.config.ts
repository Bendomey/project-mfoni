import { type Config } from 'tailwindcss'

export default {
	mode: 'jit',
	content: ['./app/**/*.+(js|jsx|ts|tsx|mdx|md)'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Plus Jakarta Sans', 'sans-serif'],
				shantell: ['Shantell Sans', 'sans-serif'],
			},
			zIndex: {
				'-1': '-1',
				'1': '1',
				'2': '2',
				'3': '3',
				'4': '4',
				'5': '5',
				'6': '6',
				'7': '7',
				'8': '8',
				'9': '9',
			},
		},
	},
	plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
} satisfies Config
