/** @type {import('@remix-run/dev').AppConfig} */
export default {
	cacheDirectory: './node_modules/.cache/remix',
	ignoredRouteFiles: ['**/*'],
	serverModuleFormat: 'esm',
	serverPlatform: 'node',
	tailwind: true,
	postcss: true,
	watchPaths: ['./tailwind.config.ts'],
}
