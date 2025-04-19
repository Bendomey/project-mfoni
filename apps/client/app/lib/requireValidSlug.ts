export function requireValidSlug(slug: unknown): asserts slug is string {
	if (typeof slug !== 'string' || !/^[a-zA-Z0-9-_.]+$/.test(slug)) {
		throw new Response(`This is not a valid slug: "${slug}"`, { status: 400 })
	}
}