export default {
	plugins: {
		'postcss-import': {},
		'tailwindcss/nesting': {},
		tailwindcss: {},
		autoprefixer: {},
		cssnano: process.env.NODE_ENV === 'production' ? {} : false,
	},
}
