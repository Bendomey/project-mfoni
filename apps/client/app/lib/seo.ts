import { safeString } from './strings.ts'

const MAX_LENGTH_META_DESCRIPTION = 150

export function getSocialMetas({
	url,
	title = 'mfoni Gallery',
	description = 'The best photo gallery shared by creators in Ghana.',
	images = [],
	keywords = 'mfoni, Mfoni',
}: {
	images?: Array<string>
	url: string
	title?: string
	description?: string
	keywords?: string
}) {
	const ogImages = images.map((image) => {
		return { name: 'og:image', content: image }
	})

	const twitterImages = images.map((image) => {
		return { name: 'twitter:image', content: image }
	})

	const truncateDescription =
		description.length > MAX_LENGTH_META_DESCRIPTION
			? description.slice(0, MAX_LENGTH_META_DESCRIPTION) + '...'
			: description.slice(0, MAX_LENGTH_META_DESCRIPTION)

	const metas = [
		{ title },
		{ name: 'title', content: title },
		{ name: 'description', content: truncateDescription },
		{ name: 'keywords', content: `mfoni${keywords ? `, ${keywords}` : ''}` },
		{ name: 'og:url', content: url },
		{ name: 'og:site_name', content: 'mfoni' },
		{ name: 'og:type', content: 'website' },
		{ name: 'og:title', content: title },
		{ name: 'og:description', content: truncateDescription },
		...ogImages,
		{
			name: 'twitter:card',
			content: images.length ? 'summary_large_image' : 'summary',
		},
		{ name: 'twitter:creator', content: '@mfoniapp' },
		{ name: 'twitter:site', content: '@mfoniapp' },
		{ name: 'twitter:url', content: url },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: truncateDescription },
		...twitterImages,
		{ name: 'twitter:image:alt', content: title },
	]

	if (images.length) {
		metas.push({ name: 'image', content: safeString(images[0]) })
	}

	return metas
}
