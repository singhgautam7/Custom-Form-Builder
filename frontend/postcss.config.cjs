// Intentionally empty PostCSS config. We compile Tailwind into a generated CSS
// during `npm run generate:css` and import the generated file directly in the app.
module.exports = {
	plugins: [
		'tailwindcss',
		'autoprefixer'
	]
}
