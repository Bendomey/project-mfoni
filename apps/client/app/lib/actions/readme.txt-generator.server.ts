interface ReadmeTxtProps {
	imageTitle: string
	downloadDate: string
}

export function readmeTxtGenerator({
	imageTitle,
	downloadDate,
}: ReadmeTxtProps) {
	return `
		Mfoni - Content Download Package
		--------------------------------
		
		Image Title:       ${imageTitle}
		Download Date:     ${downloadDate}
		License Type:      Standard License (Personal/Commercial Use)
		
		License:
		This download includes a license PDF. Please refer to it for permitted usage.
		Unauthorized redistribution or resale of this content is strictly prohibited.
		
		Visit us at: https://www.mfoni.app
		Support: support@mfoni.app
	`
}
