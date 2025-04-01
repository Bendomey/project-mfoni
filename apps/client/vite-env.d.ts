// vite-env.d.ts
declare module '*.css?url' {
	const value: string
	export default value
}
