export const getFullUrlPath = (url: URL) => {
	return `${url.pathname}${url.search}`
}
